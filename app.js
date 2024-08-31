const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server Running at http://localhost:30000/')
    })
  } catch (e) {
    console.log(`DB Error ${e.message}`)
    process.exit(1)
  }
}

initializeDBandServer()

app.get('/movies/', async (request, response) => {
  const getQuery = `
    SELECT *
    FROM movie;`

  const getQueryResponse = await db.all(getQuery)
  response.send(
    getQueryResponse.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body

  const postQuery = `
  INSERT INTO
  movie (director_id, movie_name, lead_actor)
  VALUES 
  (
    ${directorId},
   '${movieName}', 
   '${leadActor}'
   );`

  await db.run(postQuery)
  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params

  const getQuery = `
    SELECT *
    FROM movie
    WHERE movie_id = ${movieId};`

  const getQueryResponse = await db.get(getQuery)

  const res = {
    movieId: getQueryResponse.movie_id,
    directorId: getQueryResponse.director_id,
    movieName: getQueryResponse.movie_name,
    leadActor: getQueryResponse.lead_actor,
  }
  response.send(res)
})

app.put('/movies/:movieId/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const {movieId} = request.params

  const updateQuery = `
  UPDATE movie
  SET 
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
  WHERE movie_id = ${movieId};`

  await db.run(updateQuery)

  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params

  const deleteQuery = `
  DELETE FROM 
  movie
  WHERE movie_id = ${movieId};`

  await db.run(deleteQuery)

  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const getAllDirectors = `
  SELECT *
  FROM director;`

  const getAllDirectorsResponse = await db.all(getAllDirectors)
  response.send(
    getAllDirectorsResponse.map(eachDirector => ({
      directorId: eachDirector.director_id,
      directorName: eachDirector.director_name,
    })),
  )
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params

  const getAllMoviesByDirectory = `
  SELECT *
  FROM movie
  WHERE director_id = ${directorId};`

  const getResponse = await db.all(getAllMoviesByDirectory)
  response.send(
    getResponse.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

module.exports = app
