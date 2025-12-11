// src/app/users/register-student/register-student.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register-student',
  templateUrl: './register-student.component.html',
  styleUrls: ['./register-student.component.css']
})
export class RegisterStudentComponent {
  registerForm: FormGroup;
  loading = false;
  success = '';
  error = '';
  previewImage: string | null = null;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private auth: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      skills: [''],
      education: [''],
      experience: [''],
      phone: ['']
    });
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => this.previewImage = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    const formData = new FormData();
    const values = this.registerForm.value;

    formData.append('name', values.name);
    formData.append('email', values.email);
    formData.append('password', values.password);
    formData.append('role', 'student');
    formData.append('phone', values.phone || '');
    formData.append('education', values.education || '');
    formData.append('experience', values.experience || '');

    // Skills → JSON string
    const skillsArray = values.skills
      ? values.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];
    formData.append('skills', JSON.stringify(skillsArray));

    // Profile image
    if (this.selectedFile) {
      formData.append('profileImage', this.selectedFile, this.selectedFile.name);
    }

    this.http.post('http://localhost:3000/users', formData).subscribe({
      next: (newUser: any) => {
        this.loading = false;
        this.success = 'Account created! Logging you in...';

        this.auth.login(values.email, values.password).subscribe({
          next: () => {
            setTimeout(() => this.router.navigate(['/student/offers']), 1500);
          },
          error: () => {
            this.success = 'Registered! Please log in.';
            setTimeout(() => this.router.navigate(['/users/login']), 2000);
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Registration failed. Try another email.';
      }
    });
  }
}