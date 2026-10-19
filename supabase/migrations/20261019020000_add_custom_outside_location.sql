INSERT INTO public.villages (name, transfer_fee)
SELECT 'مكان مخصوص / خارج الحامول', 0
WHERE NOT EXISTS (
  SELECT 1
  FROM public.villages
  WHERE name = 'مكان مخصوص / خارج الحامول'
);
