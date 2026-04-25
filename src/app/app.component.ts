import { Component, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { invoke } from '@tauri-apps/api/core';
import { BranchesView } from './branches/branches-view';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ReactiveFormsModule, BranchesView],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  greetingMessage = '';
  protected options = signal<{ label: string; value: string }[]>([]);
  protected readonly textControl = new FormControl('');

  ngOnInit(): void {
    this.getOptions();
    this.getCommits();
  }

  protected greet(event: SubmitEvent, name: string): void {
    event.preventDefault();

    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    invoke<string>('greet', { name }).then((text) => {
      this.greetingMessage = text;
    });
  }

  protected test(): void {
    invoke<string>('test', { text: this.textControl.value }).then((text) => {
      this.greetingMessage = text;
    });
  }

  private async getOptions(): Promise<void> {
    const opts =
      await invoke<{ label: string; value: string }[]>('dropdown_options');
    this.options.set(opts);
  }

  private async getCommits(): Promise<void> {
    const commits = await invoke<any[]>('commit_list', {
      path: 'C:/rust/tauriOne',
      branch: 'main',
    });
  }

  protected refresh(): void {}
}
