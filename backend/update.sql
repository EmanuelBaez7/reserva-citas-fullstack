START TRANSACTION;
UPDATE profiles SET password_hash = '$2a$11$k1c.5O1T3I.6O4uR.K3B4ey4r.p5r8G9y5P8j2t4O0P9r3k5O.v5C'
WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260329165556_UpdateSchema', '9.0.4');

COMMIT;

