const express = require('express')
const aplicacion = express()
const mysql = require('mysql')
const bodyParser = require('body-parser')

/*pool de conecciones */
var pool = mysql.createPool({
    connectionLimit: 20,
    host: 'localhost',
    user: 'sqluser',
    password: 'password',
    database: 'tareas_app'
})


/*Librerias instaladas para poder acceder a la base de datos */
aplicacion.use(bodyParser.json())
aplicacion.use(bodyParser.urlencoded({extended: true}))

/*
aplicacion.get('/',function(peticion,respuesta){
    respuesta.send("Bienvenido")
})
*/


/*Primer end point que es la consulta al recurso tareas */
aplicacion.get('/api/tareas',function(peticion,respuesta){
    pool.getConnection(function(err, connection){
        const query = `SELECT * FROM tareas_app.tareas;`
        
        connection.query(query,function (error, filas, campos){
            respuesta.json({data:filas})
            //la respuesta al metodo HTTP da como resultado el codigo 200, todo salio bien
        })

        connection.release()
    })
   
})
/*otro endpoint devuelve la tarea segun el id que indiquemos*/
aplicacion.get('/api/tareas/:id', function(peticion,respuesta){
   
    pool.getConnection(function(err,connection){//codigo de apertura de coneccion
        
        const query = `SELECT * FROM tareas_app.tareas WHERE id=${connection.escape(peticion.params.id)}`

        connection.query(query,function(error,filas,campos){
            if(filas.length > 0){//si se encontro resultado
                respuesta.json({data:filas[0]})
            }else{//caso contrario
                respuesta.status(404)//codigo de status no encontrado
                respuesta.send({errors: ['No se encuentra esa tarea']})
            }
       

        })

        connection.release()
    })
})

aplicacion.post('/api/tareas/',function(peticion,respuesta){
    pool.getConnection(function(err,connection){
        const query = `INSERT INTO tareas_app.tareas (descripcion) VALUES (${connection.escape(peticion.body.descripcion)})`
        
        connection.query(query, function(error, filas, campos){
            const nuevoId = filas.insertId

            const queryConsulta = `SELECT * FROM tareas_app.tareas WHERE id=${connection.escape(nuevoId)}`

            connection.query(queryConsulta,function(error,filas,campos){
                //cuando algo se creo exitosamente segun el codigo HTTP es el 201
                //indeica que ademas de que fue exitosa la creacion, se tiene un nuevo objeto
                respuesta.status(201)
                respuesta.json({data:filas[0]})
            })
        })
        connection.release()
    })
})

aplicacion.listen(8080,function(){
    console.log("Servidor Iniciado")
})
//paso final, en la linea de comandos:
//curl -X POST -H "Content-Type: application/json" \ -d '{"descripcion": "Nueva tarea" }' http://localhost:8080/api/tareas