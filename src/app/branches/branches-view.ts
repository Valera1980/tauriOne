import { JsonPipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';

@Component({
  selector: 'app-branches-view',
  imports: [],
  templateUrl: './branches-view.html',
  styleUrl: './branches-view.scss',
})
export class BranchesView implements OnInit {
  protected readonly branches = signal<any[]>([]);
  ngOnInit(): void {
    this.getBranches();
  }
  private async getBranches(): Promise<void> {
    const branches = await invoke<any[]>('branches_list', {
      path: 'C:/rust/tauriOne',
    });

    this.branches.set(branches);
  }
}
