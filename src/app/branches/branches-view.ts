import { Component, OnInit, signal } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { Branch } from '../../bindings';

@Component({
  selector: 'app-branches-view',
  imports: [],
  templateUrl: './branches-view.html',
  styleUrl: './branches-view.scss',
})
export class BranchesView implements OnInit {
  protected readonly branches = signal<Branch[]>([]);
  ngOnInit(): void {
    this.getBranches();
  }
  private async getBranches(): Promise<void> {
    const branches = await invoke<Branch[]>('branches_list', {
      path: 'C:/rust/tauriOne',
    });

    this.branches.set(branches);
  }
}
