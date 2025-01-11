import { OutputFormat, summarizeText } from "gpt-preview";

const config = {
  platform: "AwsBedrock",
  isDebug: false,
  modelId: "eu.anthropic.claude-3-5-sonnet-20240620-v1:0",
  maxTokens: 2048,
  temperature: 0.7,
  top_p: 0.9,
  awsRegion: "eu-west-1",
};

const summary = summarizeText(
  `
Generated 3 function calls
[Agent: Creature Creator] AddCreature( creature_name=sheep, icon_name=sheep-icon, land_type=prairie, age=1 )
[Agent: Plant Creator] AddPlant( plant_name=grass, icon_name=grass-icon, land_type=prairie )
[Agent: Relationship Creator] AddCreatureRelationship( from_name=sheep, to_name=grass, relationship_name=eats )
`,
  OutputFormat.JSON,
  config
);
