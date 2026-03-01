import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CompliantCredential } from './../../../../core/models/entity/lear-credential';
import { AfterViewInit, Component, inject, InjectionToken, ViewChild } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

export const compliantCredentialsToken = new InjectionToken<CompliantCredential[] | null>('COMPLIANT_CREDENTIALS_DATA');

@Component({
    selector: 'app-compliant-credentials',
    imports: [
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        TranslatePipe
    ],
    templateUrl: './compliant-credentials.component.html',
    styleUrl: './compliant-credentials.component.scss'
})
export class CompliantCredentialsComponent implements AfterViewInit {
  @ViewChild(MatPaginator) public paginator?: MatPaginator;
  @ViewChild(MatSort) public sort?: MatSort;

  private readonly translate = inject(TranslateService);

  public data: CompliantCredential[] | null = inject(compliantCredentialsToken);
  public dataSource: MatTableDataSource<CompliantCredential> | null = this.data ? new MatTableDataSource(this.data) : null;
  public displayedColumns: string[];

  constructor(){
    this.displayedColumns = ['id', 'type', 'gx:digestSRI']
  }

  public ngAfterViewInit(): void {
    if(!this.dataSource) return;
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

}
