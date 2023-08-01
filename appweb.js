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


/*Creación de un recurso */
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


/*endpoint para actualizacion  */
aplicacion.put('/api/tareas/:id', function(peticion,respuesta){


    pool.getConnection(function(err,connection){


        const query = `SELECT * FROM tareas_app.tareas WHERE id=${connection.escape(peticion.params.id)}`

        connection.query(query,function(error,filas,campos){


            if(filas.length >0){
                

                const queryUpdate = `UPDATE tareas_app.tareas SET descripcion=${connection.escape(peticion.body.descripcion)} WHERE id=${peticion.params.id}`
                
                connection.query(queryUpdate,function(error,filas,campos){


                    const queryConsulta = `SELECT * FROM tareas_app.tareas WHERE id=${connection.escape(peticion.params.id)}`
                    connection.query(queryConsulta,function(error,filas,campos){
                        respuesta.json({data:filas[0]})
                    })
                })

            }else{
                respuesta.status(404)
                respuesta.send({errors:['No se encuentra esa tarea']})
            }

        })

        connection.release()

    })

}

)


/*Endpoint para eliminar un registro */

aplicacion.delete('/api/tareas:id',function(peticion,respuesta){


    pool.getConnection(function(err,connection){
        const query = `SELECT * FROM tareas_app.tareas WHERE id=${connection.escape(peticion.params.id)}`
        connection.query(query,function(error,filas,campos){
            if(filas.length > 0){

                const queryDelete = `DELETE FROM tareas_app.tareas WHERE id=${peticion.params.id}`
                connection.query(queryDelete,function(error,filas,campos){
                    respuesta.status(204)//codigo 204: todo fue exitoso, pero no se retorna respuesta
                    respuesta.json()
                })
                
            }else{
                respuesta.status(404)
                respuesta.send({errors: ['No se encuentra esa tarea']})
            }
        })
        connection.release()
    })

})


aplicacion.listen(8080,function(){
    console.log("Servidor Iniciado")
})
//paso final, en la linea de comandos:
//creacion de recursos por linea de comando
//curl -X POST -H "Content-Type: application/json" \ -d '{"descripcion": "Nueva tarea" }' http://localhost:8080/api/tareas


//paso final, en linea de comando:
//actualizacion de recursos por linea de comando
//curl -X PUT -H "Content-Type: application/json" -d '{"descripcion": "Correr"}' http://localhost:8080/api/tareas/4


//paso final, en linea de comando:
//actualizacion de recursos por linea de comando
//curl -X DELETE -H "Content-Type: application/json" http://localhost:8080/api/tareas/4


