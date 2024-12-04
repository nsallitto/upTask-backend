import type { Request, Response } from "express";
import User from "../models/User";
import Project from "../models/Proyect";

export class TeamController {

    //BUSCAR UN COLABORADOR
    static findMember = async (req: Request, res: Response) => {
        try {
            const { email } = req.body
            const user = await User.findOne({email}).select("id email userName")
            if (!user) {
                const error = new Error('Usuario no encontrado')
                return res.status(404).json({error: error.message})
            }
            res.json(user)
        } catch (error) {
            res.status(500).json({error: "Hubo un error"})
        }
    }

    //AGREGAR UN COLABORADOR
    static addMemberById = async (req: Request, res: Response) => {
        try {
            const { id } = req.body
            const user = await User.findById(id)
            if (!user) {
                const error = new Error('Usuario no encontrado')
                return res.status(404).json({error: error.message})
            }

            //Validamos que no este ya agregado
            if (req.project.team.some( teamID => teamID.toString() === user.id.toString() )) {
                const error = new Error("El Usuario ya existe en el proyecto")
                return res.status(409).json({error: error.message})
            }

            //Agregamos el ID del usuario encontrado a Team del Proyecto
            req.project.team.push(user.id)
            await req.project.save()
            res.send("Colaborador agregado con éxito")
        } catch (error) {
            res.status(500).json({error: "Hubo un error"})
        }
    }

    //BORRAR COLABORADOR
    static deleteMemberById = async (req: Request, res: Response) => {
        try {
            const { userId } = req.params

            //Buscamos que no exista como colaborador antes de borrarlo
            if (!req.project.team.some( teamID => teamID.toString() === userId.toString())) {
                const error = new Error("El usuario no existe en el proyecto")
                return res.status(409).json({error: error.message})
            }
            req.project.team = req.project.team.filter( teamID => teamID.toString() !== userId.toString())

            await req.project.save()
            res.send("Usuario eliminado correctamente")
        } catch (error) {
            res.status(500).json({error: "Hubo un error"})
        } 
    }

    //ACCEDER A LOS MIEMBROS DE UN PROYECTO
    static getProjectTeam = async (req: Request, res: Response) => {
        try {
            const project = await Project.findById(req.project.id).populate({
                path: "team",
                select: "userName email id"
            })
            
            res.json(project.team)
        } catch (error) {
            res.status(500).json({error: "Hubo un error"})
        }

    }
}