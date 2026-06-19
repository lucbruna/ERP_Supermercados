'use client';

import { Select, MenuItem, Box } from '@mui/material';
import { Language } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { setCookie } from 'nookies';
import { useTranslations } from 'next-intl';

const locales = [
  { value: 'pt-BR', labelKey: 'locale.ptBR' },
  { value: 'en', labelKey: 'locale.en' },
];

export default function LocaleSwitcher() {
  const t = useTranslations();
  const router = useRouter();
  const currentLocale = typeof window !== 'undefined'
    ? document.cookie.replace(/(?:(?:^|.*;\s*)NEXT_LOCALE\s*=\s*([^;]*).*$)|^.*$/, '$1') || 'pt-BR'
    : 'pt-BR';

  const handleChange = (value: string) => {
    setCookie(null, 'NEXT_LOCALE', value, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
      sameSite: 'lax',
    });
    router.refresh();
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 1 }}>
      <Language sx={{ fontSize: 18, color: 'text.secondary' }} />
      <Select
        size="small"
        value={currentLocale}
        onChange={(e) => handleChange(e.target.value)}
        sx={{
          minWidth: 130,
          '& .MuiSelect-select': { py: 0.5, fontSize: 13 },
          '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
          '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
        }}
      >
        {locales.map((loc) => (
          <MenuItem key={loc.value} value={loc.value} sx={{ fontSize: 13 }}>
            {t(loc.labelKey)}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}
