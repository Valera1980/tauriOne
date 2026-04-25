import { Component, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
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
  protected refreshTick = signal(0);

  ngOnInit(): void {
    this.getOptions();
  }

  protected greet(event: SubmitEvent, name: string): void {
    event.preventDefault();
    invoke<string>('greet', { name }).then((text) => {
      this.greetingMessage = text;
    });
  }

  private async getOptions(): Promise<void> {
    const opts =
      await invoke<{ label: string; value: string }[]>('dropdown_options');
    this.options.set(opts);
  }

  protected refresh(): void {
    this.refreshTick.update((n) => n + 1);
  }
}
