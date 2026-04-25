import {
  Component,
  effect,
  ElementRef,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { invoke } from '@tauri-apps/api/core';
import { createGitgraph, templateExtend, TemplateName } from '@gitgraph/js';
import { CommitInfo } from '../../bindings';

@Component({
  selector: 'app-branches-view',
  imports: [DatePipe],
  templateUrl: './branches-view.html',
  styleUrl: './branches-view.scss',
})
export class BranchesView implements OnInit {
  private readonly graphContainer =
    viewChild.required<ElementRef>('graphContainer');
  private readonly options = {
    template: templateExtend(TemplateName.Metro, {
      colors: [
        '#6366f1',
        '#22c55e',
        '#f59e0b',
        '#ec4899',
        '#14b8a6',
        '#f97316',
      ],
      branch: {
        lineWidth: 4,
        spacing: 40,
        label: {
          font: 'normal 12',
        },
      },
      commit: {
        spacing: 40,
        dot: {
          size: 12,
          strokeColor: '#fff',
          strokeWidth: 4,
        },
        message: {
          font: 'normal 12',
        },
      },
    }),
  };

  refreshing = signal(false);

  protected readonly hoveredCommit = signal<CommitInfo | null>(null);

  constructor() {
    effect(() => {
      if (this.refreshing()) {
        this.initUi();
      }
    });
  }

  ngOnInit(): void {
    this.initUi();
  }

  private initUi(): void {
    invoke<CommitInfo[]>('graph_log', { path: 'C:/rust/tauriOne' }).then(
      (commits) => this.renderGraph(commits),
    );
  }

  private renderGraph(commits: CommitInfo[]): void {
    const gitGraph = createGitgraph(
      this.graphContainer().nativeElement,
      this.options,
    );
    const branchMap = new Map<string, ReturnType<typeof gitGraph.branch>>();

    const ordered = [...commits].reverse();
    for (const commit of ordered) {
      const branchName = commit.branches[0] ?? 'main';
      if (!branchMap.has(branchName)) {
        branchMap.set(branchName, gitGraph.branch(branchName));
      }
      branchMap.get(branchName)!.commit({
        hash: commit.id.slice(0, 7),
        subject: commit.message,
        author: commit.author,
        onMouseOver: (c) => {
          this.hoveredCommit.set({
            id: commit.id,
            author: commit.author,
            message: commit.message,
            time: commit.time,
            parents: commit.parents,
            branches: commit.branches,
          });
          // show a tooltip, update a signal, etc.
        },
        onMouseOut: () => {
          this.hoveredCommit.set(null);
          // hide tooltip
        },
      });
    }
  }
}
