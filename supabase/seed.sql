-- ============================================================
-- EcoRed — Seed de datos demo para el hackathon
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

DO $$
DECLARE
  org_uuid  UUID;
  cls1_uuid UUID;
  cls2_uuid UUID;
  cls3_uuid UUID;

  u1 UUID := gen_random_uuid();
  u2 UUID := gen_random_uuid();
  u3 UUID := gen_random_uuid();
  u4 UUID := gen_random_uuid();
  u5 UUID := gen_random_uuid();
BEGIN

  -- ── 1. Obtener la primera organización existente ─────────────────────────
  SELECT id INTO org_uuid FROM organizations ORDER BY created_at ASC LIMIT 1;

  IF org_uuid IS NULL THEN
    RAISE EXCEPTION 'No se encontró ninguna organización. Primero crea una desde el onboarding de EcoRed.';
  END IF;

  RAISE NOTICE 'Usando organización: %', org_uuid;

  -- ── 2. Puntos de acopio (Lima — datos realistas) ──────────────────────────
  INSERT INTO recycling_points (org_id, name, address, lat, lng, materials, schedule)
  VALUES
    (org_uuid,
     'EcoPunto Miraflores',
     'Av. Larco 1150, Miraflores, Lima',
     -12.1225, -77.0300,
     ARRAY['plastic','paper','glass','metal']::waste_category[],
     'Lun–Sáb 8:00am–6:00pm'),

    (org_uuid,
     'Centro de Reciclaje San Isidro',
     'Calle Las Flores 350, San Isidro, Lima',
     -12.0964, -77.0365,
     ARRAY['plastic','electronic','hazardous']::waste_category[],
     'Mar–Dom 9:00am–5:00pm'),

    (org_uuid,
     'Punto Verde Surco',
     'Av. Benavides 5440, Santiago de Surco, Lima',
     -12.1500, -76.9987,
     ARRAY['organic','paper','glass','plastic']::waste_category[],
     'Lun–Vie 7:00am–7:00pm'),

    (org_uuid,
     'EcoRecolector Barranco',
     'Av. Miguel Grau 340, Barranco, Lima',
     -12.1520, -77.0210,
     ARRAY['metal','electronic','plastic']::waste_category[],
     'Mié–Dom 10:00am–4:00pm'),

    (org_uuid,
     'ReciclaYa Jesús María',
     'Av. Brasil 2900, Jesús María, Lima',
     -12.0750, -77.0533,
     ARRAY['paper','glass','metal','organic']::waste_category[],
     'Lun–Sáb 8:00am–8:00pm')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Puntos de acopio insertados';

  -- ── 3. Aulas demo (solo si es colegio) ───────────────────────────────────
  IF EXISTS (SELECT 1 FROM organizations WHERE id = org_uuid AND type = 'school') THEN
    INSERT INTO classrooms (org_id, name, grade) VALUES
      (org_uuid, '3° A',   'Tercer grado'),
      (org_uuid, '3° B',   'Tercer grado'),
      (org_uuid, '4° A',   'Cuarto grado')
    ON CONFLICT DO NOTHING;

    SELECT id INTO cls1_uuid FROM classrooms WHERE org_id = org_uuid AND name = '3° A';
    SELECT id INTO cls2_uuid FROM classrooms WHERE org_id = org_uuid AND name = '3° B';
    SELECT id INTO cls3_uuid FROM classrooms WHERE org_id = org_uuid AND name = '4° A';

    RAISE NOTICE 'Aulas insertadas: %, %, %', cls1_uuid, cls2_uuid, cls3_uuid;
  END IF;

  -- ── 4. Usuarios demo (auth + profile via trigger) ─────────────────────────
  -- Usamos SELECT ... WHERE NOT EXISTS en lugar de ON CONFLICT (email),
  -- porque auth.users usa índice parcial, no constraint directo.

  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  SELECT '00000000-0000-0000-0000-000000000000', u1, 'authenticated', 'authenticated',
    'carlos.quispe@demo.ecored.pe', crypt('EcoRed2026!', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Carlos Quispe","role":"student"}',
    NOW(), NOW(), '', '', '', ''
  WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'carlos.quispe@demo.ecored.pe');
  SELECT id INTO u1 FROM auth.users WHERE email = 'carlos.quispe@demo.ecored.pe';

  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  SELECT '00000000-0000-0000-0000-000000000000', u2, 'authenticated', 'authenticated',
    'lucia.mamani@demo.ecored.pe', crypt('EcoRed2026!', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Lucía Mamani","role":"student"}',
    NOW(), NOW(), '', '', '', ''
  WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'lucia.mamani@demo.ecored.pe');
  SELECT id INTO u2 FROM auth.users WHERE email = 'lucia.mamani@demo.ecored.pe';

  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  SELECT '00000000-0000-0000-0000-000000000000', u3, 'authenticated', 'authenticated',
    'diego.flores@demo.ecored.pe', crypt('EcoRed2026!', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Diego Flores","role":"student"}',
    NOW(), NOW(), '', '', '', ''
  WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'diego.flores@demo.ecored.pe');
  SELECT id INTO u3 FROM auth.users WHERE email = 'diego.flores@demo.ecored.pe';

  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  SELECT '00000000-0000-0000-0000-000000000000', u4, 'authenticated', 'authenticated',
    'sofia.vargas@demo.ecored.pe', crypt('EcoRed2026!', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sofía Vargas","role":"student"}',
    NOW(), NOW(), '', '', '', ''
  WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'sofia.vargas@demo.ecored.pe');
  SELECT id INTO u4 FROM auth.users WHERE email = 'sofia.vargas@demo.ecored.pe';

  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  SELECT '00000000-0000-0000-0000-000000000000', u5, 'authenticated', 'authenticated',
    'miguel.torres@demo.ecored.pe', crypt('EcoRed2026!', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Miguel Torres","role":"student"}',
    NOW(), NOW(), '', '', '', ''
  WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'miguel.torres@demo.ecored.pe');
  SELECT id INTO u5 FROM auth.users WHERE email = 'miguel.torres@demo.ecored.pe';

  RAISE NOTICE 'Usuarios demo creados: %, %, %, %, %', u1, u2, u3, u4, u5;

  -- ── 5. Actualizar profiles: asignar org + puntos + aula ──────────────────
  UPDATE profiles SET
    org_id       = org_uuid,
    points       = 485,
    classroom_id = cls1_uuid
  WHERE id = u1;

  UPDATE profiles SET
    org_id       = org_uuid,
    points       = 320,
    classroom_id = cls1_uuid
  WHERE id = u2;

  UPDATE profiles SET
    org_id       = org_uuid,
    points       = 275,
    classroom_id = cls2_uuid
  WHERE id = u3;

  UPDATE profiles SET
    org_id       = org_uuid,
    points       = 190,
    classroom_id = cls2_uuid
  WHERE id = u4;

  UPDATE profiles SET
    org_id       = org_uuid,
    points       = 145,
    classroom_id = cls3_uuid
  WHERE id = u5;

  RAISE NOTICE 'Profiles actualizados';

  -- ── 6. Scans demo (para historial y actividad reciente) ─────────────────
  INSERT INTO scans (user_id, org_id, classroom_id, waste_category, waste_name, material, recyclable, instructions, points_earned)
  VALUES
    -- Carlos Quispe (u1)
    (u1, org_uuid, cls1_uuid, 'plastic',    'Botella PET 500ml',        'PET',       true,  'Enjuaga y aplasta antes de depositar.',                15),
    (u1, org_uuid, cls1_uuid, 'paper',      'Periódico reciclado',       'Papel',     true,  'Dobla y lleva al punto de acopio más cercano.',         10),
    (u1, org_uuid, cls1_uuid, 'glass',      'Tarro de vidrio',           'Vidrio',    true,  'Retira la tapa y enjuaga el interior.',                 12),
    (u1, org_uuid, cls1_uuid, 'metal',      'Lata de aluminio',          'Aluminio',  true,  'Aplasta para reducir volumen.',                         20),
    (u1, org_uuid, cls1_uuid, 'plastic',    'Envase de shampoo',         'HDPE',      true,  'Vacía y enjuaga con agua.',                             15),
    -- Lucía Mamani (u2)
    (u2, org_uuid, cls1_uuid, 'paper',      'Caja de cartón',            'Cartón',    true,  'Aplana la caja y retira cintas adhesivas.',             10),
    (u2, org_uuid, cls1_uuid, 'organic',    'Cáscaras de fruta',         'Orgánico',  false, 'Ideal para compost casero.',                             5),
    (u2, org_uuid, cls1_uuid, 'plastic',    'Bolsa plástica',            'LDPE',      true,  'Lava y seca antes de depositar.',                       15),
    -- Diego Flores (u3)
    (u3, org_uuid, cls2_uuid, 'electronic', 'Cargador en desuso',        'Electrónico',false,'Lleva a punto de acopio electrónico especializado.',    25),
    (u3, org_uuid, cls2_uuid, 'plastic',    'Botella de plástico',       'PET',       true,  'Enjuaga y aplasta antes de depositar.',                 15),
    (u3, org_uuid, cls2_uuid, 'metal',      'Tapa metálica',             'Acero',     true,  'Recoge varias tapas juntas antes de llevarlas.',        20),
    -- Sofía Vargas (u4)
    (u4, org_uuid, cls2_uuid, 'paper',      'Hojas de papel bond',       'Papel',     true,  'Agrupa en fardos para facilitar su traslado.',          10),
    (u4, org_uuid, cls2_uuid, 'glass',      'Botella de vidrio',         'Vidrio',    true,  'No mezclar con vidrio roto.',                           12),
    -- Miguel Torres (u5)
    (u5, org_uuid, cls3_uuid, 'plastic',    'Envase de yogur',           'PP',        true,  'Enjuaga con agua tibia.',                               15),
    (u5, org_uuid, cls3_uuid, 'paper',      'Revista reciclada',         'Papel',     true,  'Retira portadas plastificadas si las tiene.',           10)
  ON CONFLICT DO NOTHING;

  -- ── 7. Impact logs (para métricas CO₂ y kg reciclados) ───────────────────
  INSERT INTO impact_logs (user_id, org_id, co2_saved_kg, waste_kg)
  VALUES
    (u1, org_uuid, 0.411, 0.620),
    (u2, org_uuid, 0.141, 0.710),
    (u3, org_uuid, 0.462, 0.160),
    (u4, org_uuid, 0.077, 0.500),
    (u5, org_uuid, 0.123, 0.250)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '✓ Seed completado exitosamente para org: %', org_uuid;
  RAISE NOTICE '  Usuarios demo: carlos, lucia, diego, sofia, miguel @demo.ecored.pe (pass: EcoRed2026!)';
  RAISE NOTICE '  Puntos de acopio: 5 registrados en Lima';

END $$;
