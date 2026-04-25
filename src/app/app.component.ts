import { Component, OnInit, signal } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { RouterOutlet } from "@angular/router";
import { invoke,  } from "@tauri-apps/api/core";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, ReactiveFormsModule],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent implements OnInit {
  
  greetingMessage = "";
  protected  options = signal<{label:string, value: string}[]>([]);
  protected readonly branches = signal<any[]>([]);
  protected readonly textControl = new FormControl('');

  ngOnInit(): void {
    this.getOptions();
    this.getBranches();
    this.getCommits();
  }  

  protected greet(event: SubmitEvent, name: string): void {
    event.preventDefault();

    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    invoke<string>("greet", { name }).then((text) => {
      this.greetingMessage = text;
    });
  }

  protected test(): void {
     invoke<string>("test", { text: this.textControl.value }).then((text) => {
      this.greetingMessage = text;
    });
  }

  private async getOptions(): Promise<void> {
    const opts = await invoke<{label:string, value: string}[]>("dropdown_options");
    this.options.set(opts);
  }

  private async getBranches(): Promise<void> {
    const branches = await invoke<any[]>("branches_list", { path: 'C:/rust/tauriOne' });

    this.branches.set(branches);
  }

  private async getCommits(): Promise<void> {
    const commits = await invoke<any[]>("commit_list", { path: 'C:/rust/tauriOne', branch: 'main' });
  }
}
