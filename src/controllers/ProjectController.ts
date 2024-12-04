import type { Request, Response } from "express";
import Project from "../models/Proyect";

//Lo vamos a hacer a travez de clases (asi no importamos todas las fn en projectRoutes)
export class ProjectControllers {

    //NUEVO PROYECTO
    static createProject = async (req: Request, res: Response) => {

        const project = new Project(req.body)

        //Asignamos el creador del proyecto
        project.manager = req.user.id
        try {
            await project.save()
            res.send("Proyecto creado correctamente")
        } catch (error) {
            console.log(error);
        }
    }
    //PROYECTOS
    static getAllProjects = async (req: Request, res: Response) => {
        try {
            const projects = await Project.find({
                $or: [
                    {manager: {$in: req.user.id} },
                    {team: {$in: req.user.id} }
                ]
            })
            return res.json(projects)
        } catch (error) {
            console.log(error);
        }
    }
    //PROYECTO
    static getProject = async (req: Request, res: Response) => {
        const { id } = req.params
        try {
            const project = await Project.findById(id).populate('tasks')
            if (!project) {
                const error = new Error("Proyecto no encontrado")
                return res.status(404).json({ error: error.message })
            }
            //Validamos que el usuario autenticado sea el creador de proyecto
            if (project.manager.toString() !== req.user.id.toString() && !project.team.includes(req.user.id)) {
                const error = new Error("Acción no válida")
                return res.status(404).json({error: error.message})
            }
            res.json(project)
        } catch (error) {
            console.log(error);
        }
    }
    //ACTUALIZAR PROYECTO
    static updateProject = async (req: Request, res: Response) => {
        try {
            req.project.projectName = req.body.projectName
            req.project.clientName = req.body.clientName
            req.project.description = req.body.description

            await req.project.save()
            res.send("Proyecto actualizado")
        } catch (error) {
            console.log(error);
        }
    }
    //ELIMINAR PROYECTO
    static deleteProject = async (req: Request, res: Response) => {
        try {
            await req.project.deleteOne()
            res.send("Proyecto eliminado")
        } catch (error) {
            console.log(error);
        }
    }

}