-- Remove the hardcoded default ID for agents
ALTER TABLE "agents" ALTER COLUMN "id" DROP DEFAULT;

-- Add a trigger to generate IDs using createId()
CREATE OR REPLACE FUNCTION generate_agent_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate a unique ID using timestamp and random string
  NEW.id := 'cl_' || to_char(extract(epoch from now())::bigint, 'FM0000000000') || '_' || substr(md5(random()::text), 1, 10);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_agent_id
  BEFORE INSERT ON agents
  FOR EACH ROW
  WHEN (NEW.id IS NULL)
  EXECUTE FUNCTION generate_agent_id(); 