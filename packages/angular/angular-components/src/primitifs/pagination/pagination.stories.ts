import { Component, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SocPagination } from './pagination';

@Component({
  selector: 'story-pagination-default',
  standalone: true,
  imports: [SocPagination],
  template: `<soc-pagination [currentPage]="page()" [totalPages]="4" (pageChange)="page.set($event)" />`,
})
class DefaultDemo {
  page = signal(1);
}

@Component({
  selector: 'story-pagination-ellipsis',
  standalone: true,
  imports: [SocPagination],
  template: `<soc-pagination [currentPage]="page()" [totalPages]="20" (pageChange)="page.set($event)" />`,
})
class EllipsisDemo {
  page = signal(10);
}

@Component({
  selector: 'story-pagination-info-size',
  standalone: true,
  imports: [SocPagination],
  template: `
    <soc-pagination
      [currentPage]="page()"
      [totalPages]="10"
      (pageChange)="page.set($event)"
      [totalEntries]="200"
      [pageSize]="pageSize()"
      (pageSizeChange)="pageSize.set($event)"
    />
  `,
})
class InfoAndPageSizeDemo {
  page = signal(1);
  pageSize = signal(20);
}

@Component({
  selector: 'story-pagination-no-first-last',
  standalone: true,
  imports: [SocPagination],
  template: `<soc-pagination [currentPage]="page()" [totalPages]="4" (pageChange)="page.set($event)" [hasFirstLast]="false" />`,
})
class WithoutFirstLastDemo {
  page = signal(1);
}

@Component({
  selector: 'story-pagination-dots',
  standalone: true,
  imports: [SocPagination],
  template: `<soc-pagination [currentPage]="page()" [totalPages]="5" (pageChange)="page.set($event)" variant="dots" />`,
})
class DotsDemo {
  page = signal(1);
}

const meta: Meta<SocPagination> = {
  title: 'Components/Navigation/Pagination',
  component: SocPagination,
  tags: ['autodocs'],
  args: {
    currentPage: 1,
    totalPages: 4,
  },
};
export default meta;
type Story = StoryObj<SocPagination>;

export const Default: Story = {
  decorators: [moduleMetadata({ imports: [DefaultDemo] })],
  render: () => ({ template: `<story-pagination-default />` }),
};

export const WithEllipsis: Story = {
  decorators: [moduleMetadata({ imports: [EllipsisDemo] })],
  render: () => ({ template: `<story-pagination-ellipsis />` }),
};

export const WithInfoAndPageSize: Story = {
  decorators: [moduleMetadata({ imports: [InfoAndPageSizeDemo] })],
  render: () => ({ template: `<story-pagination-info-size />` }),
};

export const WithoutFirstLast: Story = {
  decorators: [moduleMetadata({ imports: [WithoutFirstLastDemo] })],
  render: () => ({ template: `<story-pagination-no-first-last />` }),
};

export const Dots: Story = {
  decorators: [moduleMetadata({ imports: [DotsDemo] })],
  render: () => ({ template: `<story-pagination-dots />` }),
};
