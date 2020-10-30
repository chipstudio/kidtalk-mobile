// Model Definitions
var User = {
	email: String.hashed_email,
	first_name: String,
	last_saw_survey: Number,
	race_ethnicity: String,
	id: String.id,
	verified: Boolean,
	has_initialed: Boolean,
	parent_avatar: Number.parent_avatar,
	share_audio_research_dbs: Boolean,
	share_transcript_research_dbs: Boolean,
	share_audio_guess_the_word: Boolean,
	share_survey_research_dbs: Boolean,
	zipcode: Number.zipcode,
	last_version_seen: String,
};

var TaggedAdult = {
	id: String.id,
	has_initialed: Boolean,
	first_name: String,
	original_creator: User.id,
	email: String.hashed_email,
	parent_avatar: Number.parent_avatar,
}

var Kid = {
	birth_month: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
	birth_year: ["2020", "2019", "2018", "2017", "2016", "2015", "2014", "2013", "2012", "2011", "2010", "2009", "2008", "2007", "2006", "2005", "2004", "2003", "2002", "2001", "2000"],
	id: String.id,
	first_name: String,
	original_creator: User.id,
	kid_avatar: Number.kid_avatar
}

var Invitation = {
	id: String.id,
	original_creator: User.id,
	kid: Kid.id,
	record_access: Boolean,
	email: String.hashed_email,
	name: String,
}

var Recording = {
	audio_file: String.audio_file,
	duration: Number.duration,
	time: Number,
	file_time: Number,
	icons: Array.collection,
	id: String.id,
	is_clip: Boolean,
	can_guess: Boolean,
	tagged_kids: Array.collection,
	tagged_adults: Array.collection, 
	transcription: String,
	cimg: Number,
	comments: Array.collection,
	description: String,
	parent_id: User.id,
	private: Boolean,
	user_id: User.id,
	start: Number.duration,
	end: Number.duration
}

var Guess = {
	recording_id: Recording.id,
	guessed_transcription: String,
	actual_transcription: String,
	date: Object,
	user_id: User.id,
	correct: Boolean
}

var Mail = {
	to: String,
	message: Object
}

var SurveyResponse = {
	user_id: String.id,
	question_number: Number,
	question_text: String,
	sub_question_text: String,
	primary_answer: String,
	secondary_answers: Array.collection,
	time: Number,
}

var Lookup = {
	user_id: String.id
}