import JobRecord from "@/models/JobRecord.model.js"
import CRUDRepository from "./crud.repository.js"
import { CreationAttributes, Optional } from "sequelize"
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
}

const jobRecordRepository = new JobRecordRepository()

export default jobRecordRepository
