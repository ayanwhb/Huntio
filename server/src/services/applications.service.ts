import { JobApplication } from "../generated/prisma/client.js";
import { JobApplicationStatus, WorkModel } from "../generated/prisma/enums.js";
import { prisma } from "../util/prisma.js";

/**
 * This function retrieves all job applications that belong to a specific user.
 *
 * @param userId - The unique identifier of the user whose applications should be fetched.
 * @returns A promise that resolves to a list of JobApplication records.
 */
export async function findApplicationsByUserId(userId: string): Promise<JobApplication[]> {
	return await prisma.jobApplication.findMany({
		where: { userId: userId }
	});
}

/**
 * This function deletes a job application from the database using its unique ID.
 *
 * @param applicationId - The unique identifier of the job application to delete.
 * @returns A promise that resolves when the deletion is complete.
 */
export async function deleteApplicationById(applicationId: string): Promise<void> {
	await prisma.jobApplication.delete({
		where: { id: applicationId }
	});
}

/**
 * This function updates an existing job application with new data
 * using the application's unique ID.
 *
 * @param application - The job application object containing updated values.
 * @param applicationId - The unique identifier of the job application to update.
 * @returns A promise that resolves when the update is complete.
 */
export async function updateApplicationById(application: JobApplication, applicationId: string): Promise<void> {
	await prisma.jobApplication.update({
		where: { id: applicationId },
		data: {
			companyName: application.companyName,
			jobTitle: application.jobTitle,
			workModel: WorkModel[application.workModel],
			salary: application.salary,
			status: JobApplicationStatus[application.status]
		}
	});
}

/**
 * This function creates a new job application for a given user
 * using the provided application data.
 *
 * @param application - The job application data to persist.
 * @param userId - The unique identifier of the user who owns the application.
 * @returns A promise that resolves to the newly created JobApplication record.
 */
export async function createJobApplicationByUserId(application: JobApplication, userId: string): Promise<JobApplication> {
	const createdApplication: JobApplication = await prisma.jobApplication.create({
		data: {
			companyName: application.companyName,
			jobTitle: application.jobTitle,
			workModel: WorkModel[application.workModel],
			salary: application.salary,
			userId: userId
		}
	});

	return createdApplication;
}
