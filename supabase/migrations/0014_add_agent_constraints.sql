-- Drop existing unique constraint on sourceAgentId if it exists
ALTER TABLE agents DROP CONSTRAINT IF EXISTS agents_source_agent_id_key;

-- Make sourceAgentId nullable
ALTER TABLE agents ALTER COLUMN source_agent_id DROP NOT NULL;

-- Add unique constraint on name and source combination
ALTER TABLE agents ADD CONSTRAINT agents_name_source_unique UNIQUE (name, source);

-- Add comment to explain the constraint
COMMENT ON CONSTRAINT agents_name_source_unique ON agents IS 'Ensures unique agent names per source platform'; 