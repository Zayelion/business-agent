# Business Agent Console

## Install
```
npm install
```

## Develop
```
npm run dev
```
The command boots the custom Express + Next.js server at http://localhost:3000.

## Build
```
npm run build
```

## Production
```
npm run start
```

## Trigger an agent via API
```
POST /api/agents/trigger
Content-Type: application/json
{
  "agentId": "CEO",
  "input": "Plan our Q3 growth bets"
}
```
The endpoint forwards the payload to the installed `agents` package and returns the runner output or a stubbed response when no runner is exposed.

## Where agents are defined
- The canonical list of available agents (ID, title, role, description) lives in `interface/server/ui/lib/agents.js` and powers the UI sidebar.
- Update that file whenever adding or renaming agents, and reflect those changes in API docs (see `documentation/swagger.yaml`) and any server logic that references agent IDs.
