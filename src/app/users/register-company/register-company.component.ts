// src/app/users/register-company/register-company.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';  // ← THIS WAS MISSING!
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register-company',
  templateUrl: './register-company.component.html',
  styleUrls: ['./register-company.component.css']
})
export class RegisterCompanyComponent {
  registerForm: FormGroup;
  loading = false;
  success = '';
  error = '';
  previewImage: string | null = null;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,           // ← ADD THIS LINE
    private auth: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      industry: [''],
      size: [''],
      website: [''],
      description: ['']
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
    formData.append('role', 'company');
    formData.append('industry', values.industry || '');
    formData.append('size', values.size || '');
    formData.append('website', values.website || '');
    formData.append('description', values.description || '');
    formData.append('skills', '[]'); // companies don't have skills

    if (this.selectedFile) {
      formData.append('profileImage', this.selectedFile, this.selectedFile.name);
    }

    this.http.post('http://localhost:3000/users', formData).subscribe({
      next: (newUser: any) => {
        this.loading = false;
        this.success = 'Company account created! Logging you in...';

        this.auth.login(values.email, values.password).subscribe({
          next: () => {
            setTimeout(() => this.router.navigate(['/company/offers']), 1500);
          },
          error: () => {
            this.success = 'Registered! Please log in.';
            setTimeout(() => this.router.navigate(['/users/login']), 2000);
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Registration failed.';
      }
    });
  }
}