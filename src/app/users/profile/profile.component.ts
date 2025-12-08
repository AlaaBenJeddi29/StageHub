import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { UsersService } from '../users.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any;
  editForm: FormGroup;
  editing = false;
  error: string = '';

  constructor(private auth: AuthService, private usersService: UsersService, private router: Router, private fb: FormBuilder) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    this.user = this.auth.getUser();
    if (!this.user) {
      this.router.navigate(['/users/login']);
    } else {
      this.editForm.patchValue({ name: this.user.name, email: this.user.email });
    }
  }

  toggleEdit() {
    this.editing = !this.editing;
  }

  onUpdate() {
    if (this.editForm.valid) {
      const updatedUser = { ...this.user, ...this.editForm.value };
      this.usersService.update(this.user.id, updatedUser).subscribe({
        next: (res) => {
          this.auth.logout(); // Logout and relogin to refresh localStorage
          this.auth.login(updatedUser.email, this.user.password).subscribe(() => {
            this.user = res;
            this.editing = false;
          });
        },
        error: (err) => this.error = 'Update failed: ' + err.message
      });
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}