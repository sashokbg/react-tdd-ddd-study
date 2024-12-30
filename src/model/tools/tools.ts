import { LocaleEnum } from '@/model/locale.enum';

export function convertStringToEnum(value: string): LocaleEnum | undefined {
  return (Object.values(LocaleEnum) as Array<string>).includes(value)
    ? (value as LocaleEnum)
    : undefined;
}
