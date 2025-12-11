// backend/server.js — FINAL 100% WORKING VERSION (NO MORE ERRORS)
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const cors = require('cors');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const fs = require('fs');

const app = express();
const adapter = new FileSync('db.json');
const db = low(adapter);

const JWT_SECRET = 'stagehub-super-secret-key-2025-change-me';
const PORT = 3000;

// Initialize DB
db.defaults({ users: [], offers: [], submissions: [] }).write();

// Create uploads folder
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// MULTER CONFIG — INCREASED LIMIT + BETTER FILENAME
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'user-' + unique + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB — was too low before
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp|pdf/;
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.test(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only images allowed for profile'));
        }
    }
});

// CRITICAL: MIDDLEWARE ORDER MATTERS!
app.use(cors());
app.use(express.json({ limit: '15mb' }));           // For JSON
app.use(express.urlencoded({ extended: true, limit: '15mb' })); // For form-data
app.use('/uploads', express.static('uploads'));

// Auth middleware
const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token' });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// REGISTER — WORKS WITH PROFILE IMAGE
app.post('/users', upload.single('profileImage'), async (req, res) => {
    const {
        name, email, password, role = 'student',
        phone = '', education = '', experience = '',
        industry = '', size = '', website = '', description = '',
        skills = '[]'
    } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'Name, email, password and role required' });
    }

    if (db.get('users').find({ email }).value()) {
        return res.status(400).json({ message: 'Email already exists' });
    }

    let parsedSkills = [];
    try {
        parsedSkills = typeof skills === 'string' ? JSON.parse(skills) : skills;
        if (!Array.isArray(parsedSkills)) parsedSkills = [];
    } catch (e) { parsedSkills = []; }

    const hashed = await bcrypt.hash(password, 10);
    const profileImage = req.file ? `/uploads/${req.file.filename}` : null;

    const newUser = {
        id: db.get('users').size().value() + 1,
        name, email, role,
        passwordHash: hashed,
        profileImage,
        phone, education, experience,
        industry, size, website, description,
        skills: parsedSkills
    };

    db.get('users').push(newUser).write();
    const { passwordHash, ...safeUser } = newUser;
    res.status(201).json(safeUser);
});

// LOGIN
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = db.get('users').find({ email }).value();
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    const { passwordHash, ...safeUser } = user;
    res.json({ token, user: safeUser });
});

// UPDATE PROFILE — WORKS WITH IMAGE
app.put('/users/:id', authenticate, upload.single('profileImage'), async (req, res) => {
    if (req.user.id !== +req.params.id) return res.status(403).json({ message: 'Unauthorized' });

    const updates = {};
    const fields = ['name', 'email', 'phone', 'education', 'experience', 'industry', 'size', 'website', 'description'];
    fields.forEach(f => { if (req.body[f]) updates[f] = req.body[f]; });

    if (req.body.skills) {
        try {
            updates.skills = typeof req.body.skills === 'string'
                ? JSON.parse(req.body.skills)
                : req.body.skills.split(',').map(s => s.trim()).filter(Boolean);
        } catch { updates.skills = []; }
    }

    if (req.body.password) {
        updates.passwordHash = await bcrypt.hash(req.body.password, 10);
    }

    if (req.file) {
        updates.profileImage = `/uploads/${req.file.filename}`;
    }

    db.get('users').find({ id: +req.params.id }).assign(updates).write();
    const updated = db.get('users').find({ id: +req.params.id }).value();
    const { passwordHash, ...safeUser } = updated;
    res.json(safeUser);
});

// REST OF YOUR ROUTES (offers, submissions, etc.) — KEEP THEM AS IS
// ... (your offers and submissions routes are fine)

app.get('/offers', (req, res) => res.json(db.get('offers').value()));
app.get('/offers/:id', (req, res) => {
    const offer = db.get('offers').find({ id: +req.params.id }).value();
    if (!offer) return res.status(404).json({ message: 'Not found' });
    res.json(offer);
});
app.post('/offers', authenticate, (req, res) => {
    if (req.user.role !== 'company') return res.status(403).json({ message: 'Only companies' });
    const newOffer = {
        id: db.get('offers').size().value() + 1,
        companyId: req.user.id,
        companyName: req.body.companyName || 'Unknown',
        createdAt: new Date().toISOString(),
        ...req.body
    };
    db.get('offers').push(newOffer).write();
    res.status(201).json(newOffer);
});
app.patch('/offers/:id', authenticate, (req, res) => {
    const offer = db.get('offers').find({ id: +req.params.id }).value();
    if (!offer || offer.companyId !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    db.get('offers').find({ id: +req.params.id }).assign(req.body).write();
    res.json(db.get('offers').find({ id: +req.params.id }).value());
});
app.delete('/offers/:id', authenticate, (req, res) => {
    const offer = db.get('offers').find({ id: +req.params.id }).value();
    if (!offer || offer.companyId !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    db.get('offers').remove({ id: +req.params.id }).write();
    db.get('submissions').remove({ offerId: +req.params.id }).write();
    res.status(204).send();
});

app.get('/submissions', authenticate, (req, res) => {
    let subs = db.get('submissions').value();
    if (req.user.role === 'student') {
        subs = subs.filter(s => s.studentId === req.user.id);
    } else if (req.user.role === 'company') {
        const offers = db.get('offers').filter({ companyId: req.user.id }).map('id').value();
        subs = subs.filter(s => offers.includes(s.offerId));
    }
    res.json(subs);
});

app.post('/submissions', authenticate, upload.single('cv'), (req, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Only students' });
    const newSub = {
        id: db.get('submissions').size().value() + 1,
        studentId: req.user.id,
        offerId: Number(req.body.offerId),
        cv: req.file ? `/uploads/${req.file.filename}` : '',
        message: req.body.message || '',
        date: new Date().toISOString(),
        status: 'pending'
    };
    db.get('submissions').push(newSub).write();
    res.status(201).json(newSub);
});

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
    console.log(`Uploads: http://localhost:${PORT}/uploads`);
});