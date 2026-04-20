import { JsonPipe } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { invoke,  } from "@tauri-apps/api/core";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, JsonPipe],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent implements OnInit {
  
  greetingMessage = "";
  protected  options = signal<{label:string, value: string}[]>([]);

  ngOnInit(): void {
    this.getOptions();
  }  

  protected greet(event: SubmitEvent, name: string): void {
    event.preventDefault();

    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    invoke<string>("greet", { name }).then((text) => {
      this.greetingMessage = text;
    });
  }

  private async getOptions(): Promise<void> {
    const opts = await invoke<{label:string, value: string}[]>("dropdown_options");
    this.options.set(opts);
  }
}
