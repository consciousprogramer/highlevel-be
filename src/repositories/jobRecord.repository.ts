import JobRecord from "@/models/JobRecord.model.js"
import CRUDRepository from "./crud.repository.js"
import { Attributes, CreationAttributes, Optional } from "sequelize"
import { JOB_STATUSES } from "@/utils/constants/model.constants.js"
import { v4 } from "uuid"

class JobRecordRepository extends CRUDRepository<JobRecord> {
	constructor() {
		super(JobRecord, "JobRecord")
	}

	async createJobRecord(
		jobRecord: Optional<CreationAttributes<JobRecord>, "status" | "id">,
		id?: string
	) {
		return this.model.create({
			...jobRecord,
			id: id ?? this.generateUUID(),
			status: JOB_STATUSES.PUSHED,
		})
	}

	async checkCsvGenerationJob(jobRecordId: string) {
		const jobRecord = await this.model.findOne({
			where: {
				id: jobRecordId,
				status: JOB_STATUSES.COMPLETED,
			},
			raw: true,
			attributes: ["status", "result"],
		})

		if (!jobRecord) {
			return {
				data: null,
				isCompleted: false,
			}
		}

		return {
			data: jobRecord as Pick<Attributes<JobRecord>, "status" | "result">,
			isCompleted: jobRecord.status === JOB_STATUSES.COMPLETED,
		}
	}
}

const jobRecordRepository = new JobRecordRepository()

export default jobRecordRepository
