USE master;
GO

-- 1. Kick everyone off (force close connections)
ALTER DATABASE YumRush 
SET SINGLE_USER 
WITH ROLLBACK IMMEDIATE;
GO

-- 2. Now you can drop it
DROP DATABASE YumRush;
GO