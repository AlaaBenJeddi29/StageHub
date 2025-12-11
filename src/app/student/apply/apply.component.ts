// src/app/student/apply/apply.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SubmissionsService } from '../../shared/submissions.service';
import { AuthService } from '../../users/auth.service';

@Component({
  selector: 'app-apply',
  templateUrl: './apply.component.html'
})
export class ApplyComponent implements OnInit {
  applyForm: FormGroup;
  offerId!: number;
  selectedFile: File | null = null;
  selectedFileName = '';
  fileError = '';
  loading = false;
  success = '';
  error = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private submissionsService: SubmissionsService,
    private auth: AuthService,
    public router: Router
  ) {
    this.applyForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(50)]]
    });
  }

  ngOnInit(): void {
    this.offerId = +this.route.snapshot.paramMap.get('id')!;
    if (!this.offerId || !this.auth.isAuthenticated()) {
      this.router.navigate(['/student/offers']);
    }
  }

  onFileSelect(event: any): void {
    const file: File = event.target.files[0];
    this.fileError = '';
    this.selectedFile = null;
    this.selectedFileName = '';

    if (!file) return;

    // Validate type
    if (file.type !== 'application/pdf') {
      this.fileError = 'Only PDF files are allowed';
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.fileError = 'File too large. Max 5MB';
      return;
    }

    this.selectedFile = file;
    this.selectedFileName = file.name;
  }

  onSubmit(): void {
    if (this.applyForm.invalid) return;
    if (!this.selectedFile) {
      this.fileError = 'Please upload your CV';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const formData = new FormData();
    formData.append('offerId', this.offerId.toString());
    formData.append('studentId', this.auth.getUser().id);
    formData.append('message', this.applyForm.get('message')!.value);
    formData.append('date', new Date().toISOString());
    formData.append('status', 'pending');
    formData.append('cv', this.selectedFile);

    this.submissionsService.create(formData).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Application sent successfully!';
        setTimeout(() => this.router.navigate(['/student/candidatures']), 2000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to submit application';
      }
    });
  }
}