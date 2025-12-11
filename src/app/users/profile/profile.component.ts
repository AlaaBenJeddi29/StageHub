// src/app/users/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any = null;
  editForm: FormGroup;
  editing = false;
  error = '';
  success = '';

  private apiUrl = 'http://localhost:3000'; // Update for production

  constructor(
    private auth: AuthService,
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      newPassword: [''],
      confirmPassword: [''],
      skills: [''],
      education: [''],
      experience: [''],
      industry: [''],
      size: [''],
      website: [''],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.user = this.auth.getUser();
    if (!this.user) {
      this.router.navigate(['/users/login']);
      return;
    }

    // Convert skills to string for form
    const skillsString = Array.isArray(this.user.skills)
      ? this.user.skills.join(', ')
      : (this.user.skills || '');

    this.editForm.patchValue({
      name: this.user.name,
      email: this.user.email,
      phone: this.user.phone || '',
      skills: skillsString,
      education: this.user.education || '',
      experience: this.user.experience || '',
      industry: this.user.industry || '',
      size: this.user.size || '',
      website: this.user.website || '',
      description: this.user.description || ''
    });
  }

  getProfileImageUrl(): string {
    if (!this.user.profileImage) {
      return 'https://via.placeholder.com/200';
    }
    return `${this.apiUrl}${this.user.profileImage}`;
  }

  toggleEdit(): void {
    this.editing = !this.editing;
    this.error = '';
    this.success = '';
  }

  onUpdate(): void {
    if (this.editForm.invalid) return;

    const formData = new FormData();
    const values = this.editForm.value;

    formData.append('name', values.name);
    formData.append('email', values.email);
    formData.append('phone', values.phone || '');

    if (values.newPassword) {
      if (values.newPassword !== values.confirmPassword) {
        this.error = 'Passwords do not match';
        return;
      }
      formData.append('password', values.newPassword);
    }

    if (this.user.role === 'student') {
      const skillsArray = values.skills
        ? values.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];
      formData.append('skills', JSON.stringify(skillsArray));
      formData.append('education', values.education || '');
      formData.append('experience', values.experience || '');
    }

    if (this.user.role === 'company') {
      formData.append('industry', values.industry || '');
      formData.append('size', values.size || '');
      formData.append('website', values.website || '');
      formData.append('description', values.description || '');
    }

    const fileInput = document.getElementById('profileImage') as HTMLInputElement;
    if (fileInput?.files?.[0]) {
      formData.append('profileImage', fileInput.files[0]);
    }

    this.http.put(`${this.apiUrl}/users/${this.user.id}`, formData).subscribe({
      next: (updatedUser: any) => {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        this.user = updatedUser;
        this.editing = false;
        this.success = 'Profile updated successfully! 🎉';
      },
      error: (err) => {
        this.error = err.error?.message || 'Update failed 😔';
      }
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}