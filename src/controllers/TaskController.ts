import { Request, Response } from "express"
import Task from "../models/Task";


export class TaskController {

    //NUEVA TAREA
    static createTask = async (req: Request, res: Response) => {
        try {
            const task = new Task(req.body)
            task.project = req.project.id
            req.project.tasks.push(task.id)
            await Promise.allSettled([task.save(), req.project.save()])
            res.send("Tarea creada correctamente")
        } catch (error) {
            res.status(500).json({ error: "Hubo un error"})
        }
    }
    //OBTENER TODAS LAS TAREAS
    static getTasks = async (req: Request, res: Response) => {
        try {
            const tasks = await Task.find({project: req.project.id}).populate('project')
            res.json(tasks)
        } catch (error) {
            res.status(500).json({ error: "Hubo un error"})
        }
    }
    //OBTENER UNA TAREA
    static getTask = async (req: Request, res: Response) => {
        try {
            const task = await Task.findById(req.task.id)
                                                    .populate({path: "completedBy.user", select: "id userName email"})
                                                    .populate({path: "notes", populate: {path: "createdBy", select: "id email userName"}})
            res.json(task)
        } catch (error) {
            res.status(500).json({ error: "Hubo un error"})
        }
    }
    //EDITAR TAREA
    static updateTask = async (req: Request, res: Response) => {
        try {
            req.task.taskName = req.body.taskName
            req.task.description = req.body.description
            await req.task.save()
            res.send("Tarea actualizada correctamente")
        } catch (error) {
            res.status(500).json({ error: "Hubo un error"})
        }        
    }
    //ELIMINAR TAREA
    static deleteTask = async (req: Request, res: Response) => {
        try {
            //traemos las tareas cuyos id son distintos al que queremos eliminar
            req.project.tasks = req.project.tasks.filter( task => task.toString() !== req.task.id.toString() )
            await Promise.allSettled([req.task.deleteOne(), req.project.save()])
            res.send("Tarea eliminada correctamente")
        } catch (error) {
            res.status(500).json({ error: "Hubo un error"})
        }
    }
    //EDITAR STATUS
    static updateStatus = async (req: Request, res: Response) => {
        const { status } = req.body
        try {
            req.task.status = status
            const data = {
                user: req.user.id,
                status
            }
            req.task.completedBy.push(data)
            await req.task.save()
            res.send("Status actualizado")
        } catch (error) {
            res.status(500).json({ error: "Hubo un error"})
        }
        
    }


}