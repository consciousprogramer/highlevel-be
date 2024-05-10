export const appConfig = {
	PRECISION: 4,
	paginationDefaults: {
		limit: 10,
		skip: 0,
		sortOn: "createdAt",
		sortOrder: "DESC",
	},
	s3: {
		setupConfig: {
			bucketName: "ghl-be-bucket",
			region: "ap-south-1",
			accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID!,
			secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY!,
		},
		preferences: {
			csv: {
				preSingedUrlValidity: 60, // In mins
			},
		},
	},
}
