import { BaseSearchDto } from './common';
import { Person } from './person';
import { FileDescription } from './file';

export interface Certificate {
  id: string;
  code: string;
  name: string;
  description?: string;
  person?: Person;
  certificateFile?: FileDescription;

  // Audit
  voided?: boolean;
  createdAt?: string;
  modifiedAt?: string;
  createdBy?: string;
  modifiedBy?: string;
}

export interface CertificateFormData {
  id?: string;
  code: string;
  name: string;
  description?: string;
  personId: string;
  fileId?: string;
}

export interface SearchCertificateDto extends BaseSearchDto {
  code?: string;
  personId?: string;
}

export const defaultSearchCertificateDto: SearchCertificateDto = {
  pageIndex: 0,
  pageSize: 10,
  sortBy: 'createdAt',
  sortDirection: 'DESC',
  voided: false,
};

