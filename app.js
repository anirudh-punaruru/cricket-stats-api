const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "cricketTeam.db");

const app = express();
app.use(express.json());
let db = null;

const initializeDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Database Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (req, res) => {
  const getPlayersQuery = `
    select *
    from cricket_team;`;
  const playersArray = await db.all(getPlayersQuery);
  console.log(playersArray);
  res.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
  console.log(playersArray);
});

app.get("/players/:playerId", async (req, res) => {
  const { playerId } = req.params;
  const getPlayerQuery = `
    select *
    from cricket_team
    where player_id= ${playerId};`;
  const player = await db.get(getPlayerQuery);
  res.send(convertDbObjectToResponseObject(player));
  console.log(player);
});

app.post("/players/", async (req, res) => {
  const { playerName, jerseyNumber, role } = req.body;
  const postPlayerQuery = `
    insert into 
    cricket_team (player_name, jersey_number, role)
    values
    ('${playerName}', '${jerseyNumber}', '${role}');`;
  await db.run(postPlayerQuery);
  res.send("Player Added to Team");
});

app.put("/players/:playerId/", async (req, res) => {
  const { playerName, jerseyNumber, role } = req.body;
  const { playerId } = req.params;
  const updatePlayerQuery = `
    update cricket_team
    set 
        player_name= '${playerName}',
        jersey_number= '${jerseyNumber}',
        role= '${role}'
    where
        player_id= '${playerId}';`;
  await db.run(updatePlayerQuery);
  res.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const deletePlayerQuery = `
    delete 
    from cricket_team
    where player_id='${playerId}';`;
  await db.run(deletePlayerQuery);
  res.send("Player Removed");
});
module.exports = app;
