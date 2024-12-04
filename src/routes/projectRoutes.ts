import { Router } from "express";
import { body, param } from "express-validator"
import { ProjectControllers } from "../controllers/ProjectController";
import { TaskController } from "../controllers/TaskController";
import { handleInputErrors } from "../middleware/validacion";
import { projectExists } from "../middleware/project";
import { hasAuthorization, taskBelongsToProject, taskExist } from "../middleware/task";
import { authenticate } from "../middleware/auth";
import { TeamController } from "../controllers/TeamController";
import { NoteController } from "../controllers/NoteController";

const router = Router()

router.use(authenticate) //Se aplica a TODO el ProjectRoutes
router.param('projectId', projectExists) //con .param() aplicamos el middleware al parametro que colocamos, asi no lo usamos en cada ruta
router.param('taskId', taskExist) //cuando se una este parametro, vamos al middleware que indicamos
router.param('taskId', taskBelongsToProject)

//router Projects

router.get('/', ProjectControllers.getAllProjects)

router.get('/:id', //--> Usamos :id en lugar de :projectId para que no entre al middleware, ya que este tiene .populate
    param('id').isMongoId().withMessage('ID no válido'),

    handleInputErrors,
    ProjectControllers.getProject
)
router.post('/',
    body('projectName')
        .notEmpty().withMessage('El nombre del proyecto no puede ir vacio'),
    body('clientName')
        .notEmpty().withMessage('El nombre del cliente no puede ir vacio'),
    body('description')
        .notEmpty().withMessage('La descripcion no puede ir vacia'),
    
    handleInputErrors, 
    ProjectControllers.createProject
)
router.put('/:projectId',
    hasAuthorization,
    param("projectId").isMongoId().withMessage('ID no válido'),
    body('projectName')
        .notEmpty().withMessage('El nombre del proyecto no puede ir vacio'),
    body('clientName')
        .notEmpty().withMessage('El nombre del cliente no puede ir vacio'),
    body('description')
        .notEmpty().withMessage('La descripcion no puede ir vacia'),

    handleInputErrors,
    ProjectControllers.updateProject
)
router.delete('/:projectId',
    hasAuthorization,
    param("projectId").isMongoId().withMessage('ID no válido'),

    handleInputErrors,
    ProjectControllers.deleteProject
)

//router Task

router.get('/:projectId/task', TaskController.getTasks
)
router.get('/:projectId/task/:taskId',
    param('taskId').isMongoId().withMessage('ID no válido'),

    handleInputErrors,
    TaskController.getTask
)
router.post('/:projectId/task',
    hasAuthorization,
    param("projectId").isMongoId().withMessage('ID no válido'),
    body("taskName").notEmpty().withMessage("El nombre de la tarea no puede ir vacio"),
    body("description").notEmpty().withMessage("La descripcion no puede ir vacio"),
    
    handleInputErrors,
    TaskController.createTask
)
router.put('/:projectId/task/:taskId',
    hasAuthorization,
    param('taskId').isMongoId().withMessage('ID no válido'),
    body("taskName").notEmpty().withMessage("El nombre de la tarea no puede ir vacio"),
    body("description").notEmpty().withMessage("La descripcion no puede ir vacia"),

    handleInputErrors,
    TaskController.updateTask
)
router.delete('/:projectId/task/:taskId',
    hasAuthorization,
    param('taskId').isMongoId().withMessage("ID no válido"),

    handleInputErrors,
    TaskController.deleteTask
)
router.post('/:projectId/task/:taskId/status',
    param("taskId").isMongoId().withMessage("ID no válido"),
    body("status").notEmpty().withMessage("El status no puede ir vacio"),

    TaskController.updateStatus
)

//router Team

router.post('/:projectId/team/find',
    body("email").isEmail().toLowerCase().withMessage("Email no válido"),

    handleInputErrors,
    TeamController.findMember
)

router.post('/:projectId/team',
    body("id").isMongoId().withMessage("ID no válido"),

    handleInputErrors,
    TeamController.addMemberById
)

router.delete('/:projectId/team/:userId',
    param("userId").isMongoId().withMessage("ID no válido"),

    handleInputErrors,
    TeamController.deleteMemberById
)

router.get('/:projectId/team', TeamController.getProjectTeam)

//routes Notes

router.get('/:projectId/task/:taskId/notes',
    NoteController.getAllNotes
)

router.post('/:projectId/task/:taskId/notes', 
    body("content").notEmpty().withMessage("La nota no puede ir vacía"),
    
    handleInputErrors,
    NoteController.createNote
)

router.delete('/:projectId/task/:taskId/notes/:noteId',
    param("noteId").isMongoId().withMessage("ID no válido"),

    handleInputErrors,
    NoteController.deleteNote
)

export default router;