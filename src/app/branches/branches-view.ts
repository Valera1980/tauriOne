import {
  Component,
  effect,
  ElementRef,
  input,
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
        label: { font: 'normal 12' },
      },
      commit: {
        spacing: 40,
        dot: { size: 6, strokeColor: '#fff', strokeWidth: 4 },
        message: { font: 'normal 12' },
      },
    }),
  };

  refreshing = input<Symbol | null>(null);
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
    // some test message
  }

  private initUi(): void {
    invoke<CommitInfo[]>('graph_log', { path: 'C:/rust/tauriOne' }).then(
      (commits) => this.renderGraph(commits),
    );
  }

  // Walk first-parent chain from each branch tip to assign commits to branches.
  // main is processed first so shared history belongs to main.
  private assignBranches(commits: CommitInfo[]): Map<string, string> {
    const commitMap = new Map(commits.map((c) => [c.id, c]));
    const commitToBranch = new Map<string, string>();

    const tips = commits.filter((c) => c.branches.length > 0);
    tips.sort((a, b) => {
      if (a.branches.includes('main')) return -1;
      if (b.branches.includes('main')) return 1;
      return b.time - a.time;
    });

    for (const tip of tips) {
      const branchName = tip.branches[0];
      let current: CommitInfo | undefined = tip;
      while (current && !commitToBranch.has(current.id)) {
        commitToBranch.set(current.id, branchName);
        current = current.parents[0]
          ? commitMap.get(current.parents[0])
          : undefined;
      }
    }

    for (const commit of commits) {
      if (!commitToBranch.has(commit.id)) {
        commitToBranch.set(commit.id, 'main');
      }
    }

    return commitToBranch;
  }

  private renderGraph(commits: CommitInfo[]): void {
    const container = this.graphContainer().nativeElement;
    container.innerHTML = '';
    const gitGraph = createGitgraph(container, this.options);
    const branchMap = new Map<string, ReturnType<typeof gitGraph.branch>>();
    const commitToBranch = this.assignBranches(commits);

    const getOrCreateBranch = (name: string) => {
      if (!branchMap.has(name)) {
        branchMap.set(name, gitGraph.branch(name));
      }
      return branchMap.get(name)!;
    };

    for (const commit of [...commits].reverse()) {
      const branchName = commitToBranch.get(commit.id) ?? 'main';

      const branch = getOrCreateBranch(branchName);

      const isMerge = commit.parents.length >= 2;
      const secondParentBranch = isMerge
        ? commitToBranch.get(commit.parents[1])
        : undefined;

      if (isMerge && secondParentBranch && branchMap.has(secondParentBranch)) {
        branch.merge(branchMap.get(secondParentBranch)!, commit.message);
      } else {
        branch.commit({
          hash: commit.id.slice(0, 7),
          subject: commit.message,
          author: commit.author,
          onMouseOver: (c) => {
            this.hoveredCommit.set(commit);
            document.body.style.cursor = 'pointer';
          },
          onMouseOut: () => {
            this.hoveredCommit.set(null);
            document.body.style.cursor = 'default';
          },
        });
      }
    }

    setTimeout(() => this.applyDotHover(container));
  }

  private applyDotHover(container: HTMLElement): void {
    for (const el of container.querySelectorAll<SVGCircleElement>('circle')) {
      el.style.transition = 'transform 0.15s ease';
      el.style.transformBox = 'fill-box';
      el.style.transformOrigin = 'center';
      el.style.pointerEvents = 'all';
      el.addEventListener('mouseenter', () => el.style.transform = 'scale(1.5)');
      el.addEventListener('mouseleave', () => el.style.transform = '');
    }
  }
}
