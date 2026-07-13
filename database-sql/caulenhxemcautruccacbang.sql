SELECT
    t.name AS TableName,
    c.name AS ColumnName,
    ty.name AS DataType,
    c.max_length
FROM sys.tables t
JOIN sys.columns c ON t.object_id = c.object_id
JOIN sys.types ty ON c.user_type_id = ty.user_type_id
ORDER BY t.name, c.column_id;

-- Khóa ngoại hiện có
SELECT fk.name AS FK_Name, tp.name AS Table_, cp.name AS Column_, tr.name AS RefTable, cr.name AS RefColumn
FROM sys.foreign_keys fk
JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
JOIN sys.tables tp ON fk.parent_object_id = tp.object_id
JOIN sys.columns cp ON fkc.parent_object_id = cp.object_id AND fkc.parent_column_id = cp.column_id
JOIN sys.tables tr ON fk.referenced_object_id = tr.object_id
JOIN sys.columns cr ON fkc.referenced_object_id = cr.object_id AND fkc.referenced_column_id = cr.column_id;

-- Unique / Primary key index
SELECT t.name AS Table_, i.name AS IndexName, i.is_unique, i.is_primary_key
FROM sys.indexes i JOIN sys.tables t ON i.object_id = t.object_id
WHERE i.name IS NOT NULL;

-- Check constraint
SELECT t.name AS Table_, cc.name AS CheckName, cc.definition
FROM sys.check_constraints cc JOIN sys.tables t ON cc.parent_object_id = t.object_id;