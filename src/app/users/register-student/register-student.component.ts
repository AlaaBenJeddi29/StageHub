import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from '../users.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register-student',
  templateUrl: './register-student.component.html',
  styleUrls: ['./register-student.component.css']
})
export class RegisterStudentComponent {
  registerForm: FormGroup;
  error: string = '';

  constructor(private fb: FormBuilder, private usersService: UsersService, private auth: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const user = { ...this.registerForm.value, role: 'student' };
      this.usersService.create(user).subscribe({
        next: (newUser) => {
          this.auth.login(user.email, user.password).subscribe(() => this.router.navigate(['/users/profile']));
        },
        error: (err) => this.error = 'Registration failed: ' + err.message
      });
    }
  }
}