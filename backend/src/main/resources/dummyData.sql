
INSERT INTO account_table (
    account_id,
    first_name,
    last_name,
    username,
    email,
    password,
    region_code,
    phone_number,
    address_one,
    address_two,
    postal_code,
    two_factor_secret,
    mobile_pin,
    created
) VALUES
      (
          1,
       'Maggie',
          'May',
          'MMay',
          'MMay@test.com',
          '$2a$10$4t/QTRfV5jAHO2KQOOaph.2OXDtK19qh4NE1mB0n/f2dQFo1SQELi',
          NULL,
          '07700123456',
          '12 Test Street',
          NULL,
          'CF31 1AA',
          '532MDCTNSUJLFXJ2TJTLRSSJKQCR5LFD',
          NULL,
          '2025-02-14 09:12:00'
      ),
      (
          2,
       'Craig',
          'Sheppard',
          'CSheppard',
          'CSheppard@test.com',
          '$2a$10$fNs2pG.RntubroKk6JiEx.e2yt./LBBKY4wjKUq5el1XKlKklwHe2',
          NULL,
          '07700234567',
          '51 Chilcott Ave',
          NULL,
          'CF32 9RQ',
          NULL,
          NULL,
          '2020-03-02 10:45:00'
      ),
      (
          3,
       'Mark',
          'Hughes',
          'MHughes',
          'mark.hughes@test.com',
          '$2a$10$d6/bGAYiNVcwUNNZ83UN8uko.MnVoU5681zHcZPgsZRC9V0HdSFN6',
          NULL,
          '07700456789',
          '7 Oakfield Close',
          NULL,
          'CF31 2AD',
          NULL,
          NULL,
          '2025-05-29 11:03:00'
      ),
      (
          4,
       'Emily',
          'Jones',
          'EJones',
          'emily.jones@test.com',
          '$2a$10$KA5MY.49XQ62TWQXlKERluqf/X1RM6bheglBvjtJ.VNPaCvpRhrLu',
          NULL,
          '07700567890',
          '19 Bryn Terrace',
          NULL,
          'CF32 9AF',
          NULL,
          NULL,
          '2025-07-12 08:51:00'
      ),
      (
          5,
       'Daniel',
          'Roberts',
          'DRoberts',
          'daniel.roberts@test.com',
          '$2a$10$7wMqKL./RHwcPIB54o9CduJayAIMerODXhpPXr2TIi9fnOFV/gFkC',
          NULL,
          '07700678901',
          '5 Hillside Avenue',
          NULL,
          'CF31 4JD',
          NULL,
          NULL,
          '2025-08-20 16:17:00'
      ),
      (
          6,
       'Laura',
          'Williams',
          'LWilliams',
          'laura.williams@test.com',
          '$2a$10$IQbpsIOVSp1lP3xGu.6Oy.HS45iFDG9kGO3V0s/U0lTtiPpSBQloe',
          NULL,
          '07700789012',
          '2 Meadow View',
          NULL,
          'CF31 5HG',
          NULL,
          NULL,
          '2025-09-15 13:05:00'
      ),
      (
          7,
       'Olivia',
          'Davies',
          'ODavies',
          'olivia.davies@test.com',
          '$2a$10$.Cbn0cY0nAmgxVeX6upkEezlhXOvpslrpdoEnlfE3JwiQobTd5tlG',
          NULL,
          '07700901234',
          '9 Maple Gardens',
          NULL,
          'CF31 2TR',
          NULL,
          NULL,
          '2025-12-06 12:11:00'
      ),
      (
          8,
       'Ryan',
          'Price',
          'RPrice',
          'ryan.price@test.com',
          '$2a$10$tzYKmlLrSBexziekkN.MKeOc.lASp05b7AO0in3rWRNiDLJpt3bE2',
          NULL,
          '07700112233',
          '15 Riverside Walk',
          NULL,
          'CF31 1PL',
          NULL,
          NULL,
          '2026-01-11 09:34:00'
      );

INSERT INTO files_table (
    file_id,
    account_id,
    created_by,
    name,
    extension,
    created
) VALUES
      ('d1b2c3d4-e5f6-7890-dcba-ef1234567890', 1, 1,
       'safety_policy', 'pdf', '2025-02-14 10:00:00'),

      ('3cc58063-df14-4e45-bce0-15f30f5d08ff', 1, 2,
       'driving_licence_mmay', 'pdf', '2026-01-15 10:00:00'),

      ('b1c2d3e4-f5a6-7890-bcde-123456abcdef', 1, 1,
       'employee_handbook', 'pdf', '2026-03-24 10:00:00'),

      ('c1b2c3d4-e5f6-7890-dcba-ef1234567891', 1, 1,
       'sop_fire_safety', 'pdf', '2025-02-14 10:10:00'),

      (UUID(), 1, 1,
       'sop_equipment_procedures', 'pdf', '2025-02-14 10:15:00'),

      (UUID(), 1, 1,
       'fire_safety', 'pdf', '2025-02-14 10:05:00'),

      (UUID(), 2, 2,
       'training_manual', 'pdf', '2025-03-02 11:00:00'),

      (UUID(), 3, 3,
       'hr_guidelines', 'pdf', '2025-04-18 15:00:00'),

      (UUID(), 4, 4,
       'hazard_report_template', 'pdf', '2025-05-29 12:00:00'),

      (UUID(), 5, 5,
       'equipment_safety', 'pdf', '2025-07-12 09:00:00'),

      (UUID(), 6, 6,
       'workshop_rules', 'pdf', '2025-08-20 17:00:00'),

      (UUID(), 7, 7,
       'health_policy', 'pdf', '2025-09-15 14:00:00'),

      (UUID(), 8, 8,
       'emergency_procedures', 'pdf', '2025-10-30 18:00:00'),

      (UUID(), 2,2,
       'oil_spill_lift_photo', 'jpg', CURRENT_TIMESTAMP),

      (UUID(), 3, 3,
       'damaged_air_hose_photo', 'jpg', CURRENT_TIMESTAMP),

      (UUID(), 6, 6,
       'blocked_fire_exit_photo', 'jpg', CURRENT_TIMESTAMP),

      (UUID(), 4, 4,
       'loose_wheel_nuts_report', 'pdf', CURRENT_TIMESTAMP),

      (UUID(), 5, 5,
       'faulty_jack_stand_photo', 'jpg', CURRENT_TIMESTAMP),

      (UUID(), 2, 2,
       'exposed_wiring_photo', 'jpg', CURRENT_TIMESTAMP),

      (UUID(), 6, 6,
       'lift_hydraulic_leak_photo', 'jpg', CURRENT_TIMESTAMP),

      (UUID(), 3, 3,
       'missing_fire_extinguisher_photo', 'jpg', CURRENT_TIMESTAMP),

      ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1, 2,
       'payslip_jan_2026_mmay', 'pdf', '2026-01-31 17:00:00'),

      (UUID(), 1, 2,
       'payslip_feb_2026_mmay', 'pdf', '2026-02-28 17:00:00'),

      (UUID(), 5, 2,
       'payslip_jan_2026_droberts', 'pdf', '2026-01-31 17:00:00'),

      (UUID(), 5, 2,
       'payslip_feb_2026_droberts', 'pdf', '2026-02-28 17:00:00'),

      (UUID(), 1, 2,
       'p60_2025_mmay', 'pdf', '2025-04-05 17:00:00'),

      (UUID(), 6, 2,
       'payslip_jan_2026_lwilliams', 'pdf', '2026-01-31 17:00:00'),

      (UUID(), 6, 2,
       'payslip_feb_2026_lwilliams', 'pdf', '2026-02-28 17:00:00'),

      (UUID(), 7, 2,
       'payslip_jan_2026_odavies', 'pdf', '2026-01-31 17:00:00'),

      (UUID(), 7, 2,
       'payslip_feb_2026_odavies', 'pdf', '2026-02-28 17:00:00'),

      (UUID(), 8, 2,
       'payslip_jan_2026_rprice', 'pdf', '2026-01-31 17:00:00'),

      (UUID(), 8, 2,
       'payslip_feb_2026_rprice', 'pdf', '2026-02-28 17:00:00'),

      (UUID(), 5, 2,
       'nvq_level3_motor_vehicle_droberts', 'pdf', '2024-06-12 10:00:00'),

      (UUID(), 6, 2,
       'health_safety_certificate_lwilliams', 'pdf', '2024-09-18 09:30:00'),

      (UUID(), 7, 2,
       'first_aid_at_work_odavies', 'pdf', '2025-01-20 14:00:00'),

      (UUID(), 8, 2,
       'hybrid_vehicle_training_rprice', 'pdf', '2025-03-05 11:15:00'),

      (UUID(), 5, 2,
       'mot_tester_certificate_droberts', 'pdf', '2023-11-10 16:00:00');

INSERT INTO document_table (
    file_id,
    title,
    signature_required,
    created
) VALUES
      ((SELECT file_id FROM files_table WHERE name = 'safety_policy'),
       'Company Safety Policy v2.1', FALSE,'2025-02-14 10:00:00'),

      ((SELECT file_id FROM files_table WHERE name ='employee_handbook'),
       'Employee Handbook', FALSE, '2026-03-24 10:05:00'),


      ('3cc58063-df14-4e45-bce0-15f30f5d08ff',
       'Driving Licence', FALSE,'2026-01-15 10:05:00'),

      ((SELECT file_id FROM files_table WHERE name = 'sop_fire_safety'),
       'SOP: Fire Safety Procedures v5', FALSE, '2025-02-14 10:10:00'),

      ((SELECT file_id FROM files_table WHERE name = 'sop_equipment_procedures'),
       'SOP: Equipment Handling Instructions', FALSE, '2025-02-14 10:15:00'),

      ((SELECT file_id FROM files_table WHERE name = 'fire_safety'),
       'Fire Safety Guidelines', True, '2025-02-14 10:05:00'),

      ((SELECT file_id FROM files_table WHERE name = 'training_manual'),
       'Employee Training Manual v3.0', True, '2025-03-02 11:00:00'),

      ((SELECT file_id FROM files_table WHERE name = 'hr_guidelines'),
       'HR Guidelines', True, '2025-04-18 15:00:00'),

      ((SELECT file_id FROM files_table WHERE name = 'hazard_report_template'),
       'Hazard Report Template v1',True, CURRENT_TIMESTAMP - INTERVAL 1 MONTH),

      ((SELECT file_id FROM files_table WHERE name = 'equipment_safety'),
       'Equipment Safety Procedures', True, '2025-07-12 09:00:00'),

      ((SELECT file_id FROM files_table WHERE name = 'workshop_rules'),
       'Workshop Rules v4.3', FALSE, '2025-08-20 17:00:00'),

      ((SELECT file_id FROM files_table WHERE name = 'health_policy'),
       'Health and Safety Policy', True, CURRENT_TIMESTAMP - INTERVAL 1 WEEK),

      ((SELECT file_id FROM files_table WHERE name = 'emergency_procedures'),
       'Emergency Procedures', True, CURRENT_TIMESTAMP);

INSERT INTO hazard_table (
    account_id,
    title,
    question_one,
    question_two,
    question_three,
    question_four,
    question_five,
    question_six,
    is_draft,
    priority,
    action_complete,
    created
) VALUES
      (1, 'Tyre fitting Machine Fault',
       'Tyre not spinning when the machine is being operated',
       'Sudden tyre spinning can injure the operator',
       'The machine is unplugged',
       'The machine needs to be checked over and repaired',
       'Maintenance Technician',
       '2026-04-02 09:00:00',
       FALSE, 3, NULL, CURRENT_TIMESTAMP),

      (1,'Tyre fitting Machine Fault',
       'Tyre not spinning when the machine is being operated',
       'Sudden tyre spinning can injure the operator',
       'The machine is unplugged',
       'The machine needs to be checked over and repaired',
       'Maintenance Technician',
       '2026-04-02 09:00:00',
       FALSE, 3, NULL, CURRENT_TIMESTAMP),

      (2, 'Oil Spill Near Lift',
       'Oil spill near vehicle lift creating slippery surface',
       'Technicians may slip and suffer injuries',
       'Area marked with warning cone',
       'Clean spill and restock spill kits',
       'Workshop Supervisor',
       '2026-04-02 10:00:00',
       FALSE, 2, '2026-04-02 11:00:00', CURRENT_TIMESTAMP),

      (3, 'Damaged Air Hose',
       'Compressed air hose showing cracks',
       'Hose could burst causing whipping injury',
       'Hose removed from service',
       'Replace damaged hose and inspect others',
       'Maintenance Technician',
       '2026-04-02 11:30:00', FALSE, 4, NULL, CURRENT_TIMESTAMP),

      (4, 'Loose Wheel Nuts',
       'Wheel nuts not torqued correctly after service',
       'Wheel could detach while driving',
       'Vehicle held in workshop',
       'Implement torque verification check',
       'Senior Technician',
       '2026-04-03 08:30:00',
       FALSE, 5, '2026-04-03 09:45:00', CURRENT_TIMESTAMP),

      (5, 'Broken Workshop Light',
       'Light fixture above bay flickering',
       'Poor visibility could cause mistakes',
       'Temporary lighting installed',
       'Replace faulty light unit',
       'Maintenance Technician',
       '2026-04-03 09:00:00',
       FALSE, 1, '2026-04-03 12:00:00', CURRENT_TIMESTAMP),

      (6, 'Blocked Fire Exit',
       'Fire exit blocked by stacked tyres',
       'Could delay evacuation in emergency',
       'Tyres temporarily moved',
       'Reorganise tyre storage area',
       'Health and Safety Officer',
       '2026-04-03 10:00:00',
       FALSE, 4, NULL, CURRENT_TIMESTAMP),

      (2,
       'Vehicle Lift Warning Alarm Fault',
       'Lift alarm not sounding during descent',
       'Technician may not be alerted to hazards',
       'Lift isolated from use',
       'Repair lift alarm system',
       'Maintenance Engineer',
       '2026-04-03 11:00:00',
       FALSE, 5, NULL, CURRENT_TIMESTAMP),

      (3,
       'Coolant Leak',
       'Coolant leaking from vehicle during service',
       'Spill may cause slip hazard',
       'Drip tray placed under vehicle',
       'Clean area and repair leak',
       'Workshop Technician',
       '2026-04-04 08:00:00',
       FALSE, 2, '2026-04-04 09:00:00', CURRENT_TIMESTAMP),

      (4, 'Battery Acid Leak',
       'Vehicle battery leaking acid',
       'Acid exposure may cause burns',
       'Battery isolated and PPE used',
       'Dispose and replace battery safely',
       'Workshop Manager',
       '2026-04-04 09:15:00',
       FALSE, 4, NULL, CURRENT_TIMESTAMP),

      (5, 'Faulty Jack Stand',
       'Jack stand showing structural damage',
       'Vehicle could fall causing crush injury',
       'Stand removed from use',
       'Replace with certified stand',
       'Maintenance Technician',
       '2026-04-04 10:30:00',
       FALSE, 5, NULL, CURRENT_TIMESTAMP),

      (6, 'Air Compressor Overheating',
       'Compressor running hotter than normal',
       'May cause equipment failure or fire risk',
       'Machine turned off for cooling',
       'Inspect cooling system',
       'Maintenance Engineer',
       '2026-04-05 08:30:00',
       FALSE, 3, NULL, CURRENT_TIMESTAMP),

      (1, 'Loose Floor Tile',
       'Tile loose near inspection pit',
       'Technician may trip and fall',
       'Area temporarily taped',
       'Replace damaged tile',
       'Facilities Manager',
       '2026-04-05 09:00:00',
       FALSE, 2, '2026-04-05 13:00:00', CURRENT_TIMESTAMP),

      (2, 'Damaged Extension Cable',
       'Cable insulation worn',
       'Risk of electric shock',
       'Cable unplugged',
       'Replace damaged cable',
       'Maintenance Technician',
       '2026-04-05 10:00:00',
       FALSE, 4, NULL, CURRENT_TIMESTAMP),

      (3, 'Wheel Balancer Error',
       'Machine displaying calibration error',
       'Incorrect balancing may cause unsafe driving',
       'Machine taken out of use',
       'Recalibrate equipment',
       'Workshop Technician',
       '2026-04-06 08:00:00',
       FALSE, 3, NULL, CURRENT_TIMESTAMP),

      (4, 'Fuel Spill',
       'Fuel spilled during vehicle inspection',
       'Flammable hazard and slip risk',
       'Absorbent pads used',
       'Dispose of contaminated materials',
       'Workshop Supervisor',
       '2026-04-06 09:00:00',
       FALSE, 5, '2026-04-06 10:30:00', CURRENT_TIMESTAMP),

      (5, 'Worn Brake Test Rollers',
       'Brake test machine rollers worn',
       'May give inaccurate results',
       'Machine flagged for maintenance',
       'Replace rollers',
       'Maintenance Technician',
       '2026-04-06 10:15:00',
       FALSE, 3, NULL, CURRENT_TIMESTAMP),

      (6, 'Unsecured Ladder',
       'Ladder left unsecured near shelves',
       'Technician may fall while climbing',
       'Ladder moved and secured',
       'Provide ladder storage rack',
       'Facilities Manager',
       '2026-04-07 08:45:00',
       FALSE, 2, '2026-04-07 09:15:00', CURRENT_TIMESTAMP),

      (1, 'Sharp Metal Edge',
       'Sharp edge on workbench discovered',
       'Risk of hand injury',
       'Edge taped temporarily',
       'File down and cover edge',
       'Workshop Supervisor',
       '2026-04-07 09:30:00',
       FALSE, 2, NULL, CURRENT_TIMESTAMP),

      (2, 'Tyre Storage Collapse Risk',
       'Stacked tyres leaning',
       'Tyres could fall onto staff',
       'Stack stabilised',
       'Install proper tyre racking',
       'Workshop Manager',
       '2026-04-07 10:00:00',
       FALSE, 4, NULL, CURRENT_TIMESTAMP),

      (3, 'Missing Fire Extinguisher',
       'Extinguisher removed from mount',
       'Fire response equipment unavailable',
       'Temporary extinguisher placed',
       'Replace missing unit',
       'Health and Safety Officer',
       '2026-04-08 08:15:00',
       FALSE, 5, NULL, CURRENT_TIMESTAMP),

      (4, 'Computer Diagnostic Fault',
       'Diagnostic PC freezing during use',
       'May delay safety checks',
       'System restarted',
       'IT inspection required',
       'IT Support',
       '2026-04-08 09:00:00',
       TRUE, 1, NULL, CURRENT_TIMESTAMP),

      (5, 'Oil Filter Disposal Overflow',
       'Waste oil filter bin overflowing',
       'Risk of contamination and spill',
       'Bin sealed temporarily',
       'Arrange waste collection',
       'Workshop Supervisor',
       '2026-04-08 09:45:00',
       FALSE, 2, '2026-04-08 12:00:00', CURRENT_TIMESTAMP),

      (6, 'Cracked Windshield During Inspection',
       'Windshield cracked while testing',
       'Glass shards may cause injury',
       'Vehicle secured',
       'Replace windshield safely',
       'Technician',
       '2026-04-08 10:30:00', FALSE, 3, NULL, CURRENT_TIMESTAMP),

      (1, 'Glove Shortage',
       'Protective gloves running low',
       'Staff may handle chemicals without PPE',
       'Remaining gloves distributed carefully',
       'Order new PPE supplies',
       'Workshop Manager',
       '2026-04-09 08:00:00',
       TRUE, 1, NULL, CURRENT_TIMESTAMP),

      (2, 'Exposed Wiring',
       'Electrical wiring visible near workbench',
       'Risk of shock or fire',
       'Power supply switched off',
       'Repair wiring insulation',
       'Electrician',
       '2026-04-09 09:10:00',
       FALSE, 5, NULL, CURRENT_TIMESTAMP),

      (3, 'Coolant Container Unlabelled',
       'Chemical container missing label',
       'Incorrect handling risk',
       'Container isolated',
       'Add correct labeling',
       'Safety Officer',
       '2026-04-09 10:00:00',
       FALSE, 2, '2026-04-09 10:40:00', CURRENT_TIMESTAMP),

      (4, 'Trip Hazard From Tools',
       'Tools left scattered on floor',
       'Staff could trip and fall',
       'Tools cleared away',
       'Implement tool storage policy',
       'Workshop Supervisor',
       '2026-04-10 08:20:00',
       FALSE, 2, NULL, CURRENT_TIMESTAMP),

      (5, 'Brake Fluid Spill',
       'Brake fluid spilled on floor',
       'Slip hazard and chemical exposure',
       'Area cleaned with absorbent pads',
       'Review fluid handling procedure',
       'Senior Technician',
       '2026-04-10 09:00:00',
       FALSE, 3, '2026-04-10 09:45:00', CURRENT_TIMESTAMP),

      (6, 'Vehicle Lift Hydraulic Leak',
       'Hydraulic oil leaking from lift',
       'Lift failure may cause vehicle fall',
       'Lift taken out of service',
       'Repair hydraulic system',
       'Maintenance Engineer',
       '2026-04-10 10:15:00',
       FALSE, 5, NULL, CURRENT_TIMESTAMP),

      (3, 'Workshop Door Jammed',
       'Rear door difficult to open',
       'Emergency exit could be delayed',
       'Door lubricated temporarily',
       'Repair door mechanism',
       'Facilities Manager',
       '2026-04-10 11:00:00',
       FALSE, 3, NULL, CURRENT_TIMESTAMP);

INSERT INTO signature_table (
    signature_id,
    account_id,
    document_id,
    hazard_id,
    risk_assessment_id,
    created
) VALUES
      (UUID(), 1,
       (SELECT document_id FROM document_table WHERE title = 'Fire Safety Guidelines'),
       NULL,
       NULL,
       '2025-02-14 10:35:00'),

      (UUID(),2,
       (SELECT document_id FROM document_table WHERE title = 'Employee Training Manual'),
       NULL,
       NULL,
       '2025-03-02 11:20:00'),

      (UUID(),
       3,
       (SELECT document_id FROM document_table WHERE title = 'HR Guidelines'),
       NULL,
       NULL,
       '2025-04-18 15:20:00'),

      (UUID(),4,
       (SELECT document_id FROM document_table WHERE title = 'Hazard Report Template'),
       NULL,
       NULL,
       '2025-05-29 12:20:00'),

      (UUID(),5,
       (SELECT document_id FROM document_table WHERE title = 'Equipment Safety Procedures'),
       NULL,
       NULL,
       '2025-07-12 09:20:00'),

      (UUID(),6,
       NULL,
       (SELECT hazard_id FROM hazard_table WHERE title = 'Blocked Fire Exit'),
       NULL,
       '2026-04-03 10:30:00'),

      (UUID(),2,
       NULL,
       (SELECT hazard_id FROM hazard_table WHERE title = 'Oil Spill Near Lift'),
       NULL,
       '2026-04-02 11:10:00'),

      (UUID(),3,
       NULL,
       (SELECT hazard_id FROM hazard_table WHERE title = 'Damaged Air Hose'),
       NULL,
       '2026-04-02 11:45:00'),

      (UUID(),4,
       NULL,
       (SELECT hazard_id FROM hazard_table WHERE title = 'Loose Wheel Nuts'),
       NULL,
       '2026-04-03 09:00:00'),

      (UUID(),7,
       (SELECT document_id FROM document_table WHERE title = 'Health and Safety Policy'),
       NULL,
       NULL,
       '2025-09-15 14:20:00'),

      (UUID(),8,
       (SELECT document_id FROM document_table WHERE title = 'Emergency Procedures'),
       NULL,
       NULL,
       '2025-10-30 18:20:00');

INSERT INTO risk_assessment_table (
   risk_assessment_id,
   file_id,
   title,
   created
) VALUES
    (1,
     (SELECT file_id FROM files_table WHERE name = 'safety_policy'),
     'Risk Assessment for Safety Policy',
     '2025-02-14 10:45:00'),

    (2,
     (SELECT file_id FROM files_table WHERE name = 'fire_safety'),
     'Risk Assessment for Fire Safety',
     '2025-02-14 10:50:00'),

    (3,
     (SELECT file_id FROM files_table WHERE name = 'training_manual'),
     'Risk Assessment for Training Manual', '2025-03-02 11:30:00'),

    (4,
     (SELECT file_id FROM files_table WHERE name = 'hr_guidelines'),
     'Risk Assessment for HR Guidelines', '2025-04-18 15:30:00'),

    (5,
     (SELECT file_id FROM files_table WHERE name = 'hazard_report_template'),
     'Risk Assessment for Hazard Report Template',
     '2025-05-29 12:30:00'),

    (6,
     (SELECT file_id FROM files_table WHERE name = 'equipment_safety'),
     'Risk Assessment for Equipment Safety',
     '2025-07-12 09:30:00');


INSERT INTO risk_assessment_hazard_table (
    risk_assessment_id,
    hazard_id,
    created
) VALUES
      (1, 13, CURRENT_TIMESTAMP),
      (1, 18, CURRENT_TIMESTAMP),
      (1, 19, CURRENT_TIMESTAMP),
      (1, 28, CURRENT_TIMESTAMP),

      (2, 7, CURRENT_TIMESTAMP),
      (2, 21, CURRENT_TIMESTAMP),
      (2, 31, CURRENT_TIMESTAMP),

      (3, 1, CURRENT_TIMESTAMP),
      (3, 2, CURRENT_TIMESTAMP),
      (3, 5, CURRENT_TIMESTAMP),
      (3, 15, CURRENT_TIMESTAMP),
      (3, 17, CURRENT_TIMESTAMP),
      (3, 20, CURRENT_TIMESTAMP),

      (4, 22, CURRENT_TIMESTAMP),
      (4, 25, CURRENT_TIMESTAMP),
      (4, 27, CURRENT_TIMESTAMP),

      (5, 3, CURRENT_TIMESTAMP),
      (5, 8, CURRENT_TIMESTAMP),
      (5, 11, CURRENT_TIMESTAMP),
      (5, 24, CURRENT_TIMESTAMP),
      (5, 30, CURRENT_TIMESTAMP),

      (6, 4, CURRENT_TIMESTAMP),
      (6, 6, CURRENT_TIMESTAMP),
      (6, 9, CURRENT_TIMESTAMP),
      (6, 10, CURRENT_TIMESTAMP),
      (6, 12, CURRENT_TIMESTAMP),
      (6, 14, CURRENT_TIMESTAMP),
      (6, 16, CURRENT_TIMESTAMP),
      (6, 23, CURRENT_TIMESTAMP),
      (6, 26, CURRENT_TIMESTAMP),
      (6, 29, CURRENT_TIMESTAMP);

INSERT INTO hazard_files_table (
    file_id,
    hazard_id,
    created
) VALUES
      ((SELECT file_id FROM files_table WHERE name = 'oil_spill_lift_photo'),
       (SELECT hazard_id FROM hazard_table WHERE title = 'Oil Spill Near Lift'),
       CURRENT_TIMESTAMP),

      ((SELECT file_id FROM files_table WHERE name = 'damaged_air_hose_photo'),
       (SELECT hazard_id FROM hazard_table WHERE title = 'Damaged Air Hose'),
       CURRENT_TIMESTAMP),

      ((SELECT file_id FROM files_table WHERE name = 'blocked_fire_exit_photo'),
       (SELECT hazard_id FROM hazard_table WHERE title = 'Blocked Fire Exit'),
       CURRENT_TIMESTAMP),

      ((SELECT file_id FROM files_table WHERE name = 'loose_wheel_nuts_report'),
       (SELECT hazard_id FROM hazard_table WHERE title = 'Loose Wheel Nuts'),
       CURRENT_TIMESTAMP),

      ((SELECT file_id FROM files_table WHERE name = 'faulty_jack_stand_photo'),
       (SELECT hazard_id FROM hazard_table WHERE title = 'Faulty Jack Stand'),
       CURRENT_TIMESTAMP),

      ((SELECT file_id FROM files_table WHERE name = 'exposed_wiring_photo'),
       (SELECT hazard_id FROM hazard_table WHERE title = 'Exposed Wiring'),
       CURRENT_TIMESTAMP),

      ((SELECT file_id FROM files_table WHERE name = 'lift_hydraulic_leak_photo'),
       (SELECT hazard_id FROM hazard_table WHERE title = 'Vehicle Lift Hydraulic Leak'),
       CURRENT_TIMESTAMP),

      ((SELECT file_id FROM files_table WHERE name = 'missing_fire_extinguisher_photo'),
       (SELECT hazard_id FROM hazard_table WHERE title = 'Missing Fire Extinguisher'),
       CURRENT_TIMESTAMP);


INSERT INTO permissions_table (
    account_id,
    assigned_by,
    is_admin,
    is_manager,
    created
) VALUES
      (1, 2, TRUE, TRUE, CURRENT_TIMESTAMP),
      (2, NULL, TRUE, TRUE, CURRENT_TIMESTAMP),
      (3, 2, FALSE, TRUE, CURRENT_TIMESTAMP),
      (4, 2, FALSE, TRUE, CURRENT_TIMESTAMP),
      (5, 2, FALSE, FALSE, CURRENT_TIMESTAMP),
      (6, 2, FALSE, FALSE, CURRENT_TIMESTAMP),
      (7, 2, FALSE, FALSE, CURRENT_TIMESTAMP),
      (8, 2, FALSE, FALSE, CURRENT_TIMESTAMP);


INSERT INTO settings_table (
    account_id,
    large_text,
    dyslexic_font,
    highlight_text,
    text_to_speech,
    dictation,
    silent_start,
    silent_end
) VALUES
      (1, FALSE, FALSE, FALSE,
       FALSE, FALSE, '22:00:00', '07:00:00'),

      (2, FALSE, FALSE,
       FALSE, FALSE, FALSE, '22:00:00', '07:00:00'),

      (3, TRUE,  TRUE,
       FALSE, FALSE, FALSE, '18:00:00', '05:00:00'),

      (4, FALSE, FALSE,
       TRUE, FALSE,  FALSE, '18:00:00', '06:00:00'),

      (5, FALSE, FALSE,
       FALSE, FALSE, FALSE, NULL, NULL),

      (6, TRUE,  FALSE,
       TRUE, FALSE,  FALSE, NULL, NULL),

      (7, FALSE, TRUE,
       FALSE, FALSE, TRUE,  NULL, NULL),

      (8, FALSE, FALSE,
       FALSE, FALSE, FALSE, NULL, NULL);

INSERT INTO themes_table (
    account_id,
    theme,
    background,
    text,
    accent
) VALUES
      (2,'Blue', 'F6F6F8','000000', 'D20414'),
      (4, 'Dark', 'F6F6F8', '000000', '0066FF');


INSERT INTO leave_type_table (
    name,
    colour_icon,
    colour_bg,
    icon_type
) VALUES
      ('Holiday', '14A45A', 'D0EDDE', 'beach_access'),
      ('Sick Leave', 'D20414', 'F6CDD0', 'sick'),
      ('Emergency Leave', 'E8960A', 'FFECCD', 'priority_high'),
      ('Maternity/Paternity Leave', 'ad32a7', 'edd1ec', 'child_care'),
      ('Unpaid Leave', '588FFF', 'E6ECF9', 'money_off');

INSERT INTO leave_table (
    account_id,
    leave_type_id,
    start_date,
    end_date,
    is_approved,
    notes,
    response,
    created
) VALUES
      (2, 1,
      '2026-06-01 00:00:00',
      '2026-06-07 00:00:00',
      TRUE,
      'Family holiday booked earlier this year.',
      'Approved by manager.',
      CURRENT_TIMESTAMP),

      (3,2,
      '2026-04-12 00:00:00',
      '2026-04-14 00:00:00',
      TRUE,
      'Flu symptoms and doctor advised rest.',
      'Get well soon.',
      CURRENT_TIMESTAMP),

      (4,1,
      '2026-07-20 00:00:00',
      '2026-07-25 00:00:00',
      FALSE,
      'Trip abroad planned.',
      'Rejected due to staffing shortage that week.',
      CURRENT_TIMESTAMP),

      (5,3,
      '2026-05-10 00:00:00',
      '2026-05-11 00:00:00',
      TRUE,
      'Family emergency.',
      'Approved immediately.',
      CURRENT_TIMESTAMP),

      (1,3,
       '2026-05-10 00:00:00',
       '2026-05-14 00:00:00',
       FALSE,
       'Family emergency.',
       NULL,
       CURRENT_TIMESTAMP),

      (6,4,
      '2026-08-01 00:00:00',
      '2026-08-10 00:00:00',
      FALSE,
      'Personal time off requested.',
      NULL,
      CURRENT_TIMESTAMP);

INSERT INTO clock_in_table (
    clock_id,
    account_id,
    clock_in,
    clock_out,
    created
) VALUES
      (UUID(), 1, '08:00:00', '17:00:00', '2026-04-01 08:00:00'),
      (UUID(), 2, '08:15:00', '17:10:00', '2026-04-01 08:15:00'),
      (UUID(), 3, '08:05:00', '17:05:00', '2026-04-01 08:05:00'),
      (UUID(), 4, '09:00:00', '17:30:00', '2026-04-01 09:00:00'),
      (UUID(), 5, '08:20:00', '17:15:00', '2026-04-01 08:20:00'),
      (UUID(), 6, '08:10:00', '17:00:00', '2026-04-01 08:10:00'),

      (UUID(), 1, '08:02:00', '17:01:00', '2026-04-02 08:02:00'),
      (UUID(), 2, '08:18:00', '17:12:00', '2026-04-02 08:18:00'),
      (UUID(), 3, '08:00:00', '16:55:00', '2026-04-02 08:00:00'),
      (UUID(), 4, '09:05:00', '17:40:00', '2026-04-02 09:05:00');

INSERT INTO clock_in_event_table (
    account_id,
    created
) VALUES
      (1, '2026-04-01 08:00:00'),
      (2, '2026-04-01 08:15:00'),
      (3, '2026-04-01 08:05:00'),
      (4, '2026-04-01 09:00:00'),
      (5, '2026-04-01 08:20:00'),
      (6, '2026-04-01 08:10:00'),

      (1, '2026-04-02 08:02:00'),
      (2, '2026-04-02 08:18:00'),
      (3, '2026-04-02 08:00:00'),
      (4, '2026-04-02 09:05:00');

INSERT INTO admin_notifications_table (
    account_id,
    title,
    description,
    is_acknowledged,
    priority,
    created
) VALUES
      (2,'Safety Training Required',
       'Please complete the updated workshop safety training by the end of the week.',
       FALSE,
       3,
       CURRENT_TIMESTAMP),

      (3,'Hazard Report Updated',
       'The hazard report regarding the damaged air hose has been updated.',
       TRUE,
       2,
       CURRENT_TIMESTAMP),

      (4,
       'New Safety Policy',
       'A new version of the company safety policy has been uploaded and requires acknowledgement.',
       FALSE,
       4,
       CURRENT_TIMESTAMP),

      (5,'Equipment Maintenance Scheduled',
       'Workshop lift maintenance will occur tomorrow morning.',
       FALSE,
       2,
       CURRENT_TIMESTAMP);

INSERT INTO payslips_table (
    file_id,
    year,
    month,
    is_p_sixty
) VALUES
      ((SELECT file_id FROM files_table WHERE name = 'payslip_jan_2026_mmay'),
       2026, 1, FALSE),

      ((SELECT file_id FROM files_table WHERE name = 'payslip_feb_2026_mmay'),
       2026, 2, FALSE),

      ((SELECT file_id FROM files_table WHERE name = 'p60_2025_mmay'),
       2025, 4, TRUE),

      ((SELECT file_id FROM files_table WHERE name = 'payslip_jan_2026_droberts'),
       2026, 1, FALSE),

      ((SELECT file_id FROM files_table WHERE name = 'payslip_feb_2026_droberts'),
       2026, 2, FALSE),

      ((SELECT file_id FROM files_table WHERE name = 'payslip_jan_2026_lwilliams'),
       2026, 1, FALSE),

      ((SELECT file_id FROM files_table WHERE name = 'payslip_feb_2026_lwilliams'),
       2026, 2, FALSE),

      ((SELECT file_id FROM files_table WHERE name = 'payslip_jan_2026_odavies'),
       2026, 1, FALSE),

      ((SELECT file_id FROM files_table WHERE name = 'payslip_feb_2026_odavies'),
       2026, 2, FALSE),

      ((SELECT file_id FROM files_table WHERE name = 'payslip_jan_2026_rprice'),
       2026, 1, FALSE),

      ((SELECT file_id FROM files_table WHERE name = 'payslip_feb_2026_rprice'),
       2026, 2, FALSE);

INSERT INTO qualifications_table (
    account_id,
    file_id,
    title,
    details,
    created
) VALUES
        (1,
        (SELECT file_id FROM files_table WHERE name = 'safety_policy'),
         'Workshop Safety Training',
         'Internal safety training covering workshop hazards and procedures.',
         '2024-06-12 10:05:00'),

      (5,
      (SELECT file_id FROM files_table WHERE name = 'nvq_level3_motor_vehicle_droberts'),
      'NVQ Level 3 Motor Vehicle Maintenance',
      'Level 3 qualification in diagnosing and repairing light vehicles.',
      '2024-06-12 10:05:00'),

      (5,
      (SELECT file_id FROM files_table WHERE name = 'mot_tester_certificate_droberts'),
      'DVSA MOT Tester Certification',
      'Authorised MOT tester certification issued by DVSA.',
      '2023-11-10 16:10:00'),

      (6,
      (SELECT file_id FROM files_table WHERE name = 'health_safety_certificate_lwilliams'),
      'Health and Safety in the Workplace',
      'Certified course covering workplace hazard awareness and risk management.',
      '2024-09-18 09:45:00'),

      (7,
      (SELECT file_id FROM files_table WHERE name = 'first_aid_at_work_odavies'),
      'First Aid at Work',
      'Three day emergency first aid training including CPR and AED use.',
      '2025-01-20 14:15:00'),

      (8,
      (SELECT file_id FROM files_table WHERE name = 'hybrid_vehicle_training_rprice'),
      'Hybrid and Electric Vehicle Awareness',
      'Training course on safe servicing of hybrid and electric vehicles.',
      '2025-03-05 11:30:00');
