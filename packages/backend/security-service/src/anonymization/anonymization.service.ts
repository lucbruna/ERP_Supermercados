import { Injectable } from '@nestjs/common';

@Injectable()
export class AnonymizationService {
  anonymizeCPF(cpf: string): string {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '***.$2.$3-**');
  }

  anonymizeEmail(email: string): string {
    const [local, domain] = email.split('@');
    return `${local[0]}***@${domain}`;
  }

  anonymizePhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 4) {
      return cleaned.slice(0, -4).replace(/\d/g, '*') + cleaned.slice(-4);
    }
    return phone;
  }

  anonymizeName(name: string): string {
    const parts = name.trim().split(/\s+/);
    return parts[0];
  }

  anonymizeAddress(address: string): string {
    const lines = address.split(',');
    if (lines.length >= 2) {
      return lines.slice(-2).join(',').trim();
    }
    return address;
  }

  anonymizeRecord(record: Record<string, any>, fields: string[]): Record<string, any> {
    const result = { ...record };
    for (const field of fields) {
      if (result[field] !== undefined && result[field] !== null) {
        const fieldLower = field.toLowerCase();
        if (fieldLower === 'cpf') result[field] = this.anonymizeCPF(String(result[field]));
        else if (fieldLower === 'email') result[field] = this.anonymizeEmail(String(result[field]));
        else if (fieldLower === 'phone' || fieldLower === 'telefone') result[field] = this.anonymizePhone(String(result[field]));
        else if (fieldLower === 'name' || fieldLower === 'nome') result[field] = this.anonymizeName(String(result[field]));
        else if (fieldLower === 'address' || fieldLower === 'endereco') result[field] = this.anonymizeAddress(String(result[field]));
        else result[field] = '***';
      }
    }
    return result;
  }
}
