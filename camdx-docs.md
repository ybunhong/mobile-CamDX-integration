CamDigiKey KYC Verification API
Endpoints
powered by Stoplight
Verify User Info
post
https://security-server.consumer1.com/r1/CAMBODIA/GOV/{member_code}/CAMDIGIKEY_KYC/info-v2.1
Verification between submitted information with MOI information

API Code: KH.GOV.CAMDX-000003.CAMDIGIKEY_KYC.info

Version: 2.1.0

Request
Path Parameters
member_code
string
required
CamDigiKey's Member:

DEVELOPMENT: CAMDX-20201222
PRODUCTION: CAMDX-000003
Default:
CAMDX-20201222
Headers
X-Road-Client
string
required
X-Road-Client Request Header * Example: CAMBODIA/GOV/CAMDX-20201234/SUBSYTEM_CODE

Body
application/jsonapplication/xml

application/json
User Information

idNumber
string
ID Card Number

firstNameKh
string
First name in Khmer

lastNameKh
string
Last name in Khmer

firstNameEn
string
First name in English

lastNameEn
string
Last name in English

gender
string
Gener

Allowed values:
M
F
Example:
M
dob
string<date>
Date of birth

Example:
2000-01-31
issuedDate
string<date>
Issued Date

Example:
2000-01-31
expiredDate
string<date>
Expired Date

Example:
2000-01-31
Responses
200
400
500
502
Successful Response

Body
application/jsonapplication/xml

application/json
responses
/
200
error
integer
required
message
string
required
data
Response - Scoring Result
idNumber
string
score
integer
#Range [0,1]

incorrectFields
array[string]
Requested Fields or Empty

curl --request POST \
  --url https://security-server.consumer1.com/r1/CAMBODIA/GOV/CAMDX-20201222/CAMDIGIKEY_KYC/info-v2.1 \
  --header 'Accept: application/json, application/xml' \
  --header 'Content-Type: application/json' \
  --header 'X-Road-Client: ' \
  --data '{
  "idNumber": "011196245",
  "firstNameKh": "ការឌុល",
  "lastNameKh": "អេង",
  "firstNameEn": "KADOL",
  "lastNameEn": "ENG",
  "gender": "M",
  "dob": "2000-05-06",
  "issuedDate": "2016-03-23",
  "expiredDate": "2026-03-22"
}'
{
  "error": 0,
  "message": "Successfully",
  "data": {
    "idNumber": "012345678",
    "score": 1,
    "incorrectFields": [
      "incorrectFieldName"
    ]
  }
}


CamDigiKey KYC Verification API
Endpoints
powered by Stoplight
Verify User Info and User Face
post
https://security-server.consumer1.com/r1/CAMBODIA/GOV/{member_code}/CAMDIGIKEY_KYC/info-face-v2.1
Verification between submitted user information include face image with MOI information

API Code: KH.GOV.CAMDX-000003.CAMDIGIKEY_KYC.info-face

Version: 2.1.0

Request
Path Parameters
member_code
string
required
CamDigiKey's Member:

DEVELOPMENT: CAMDX-20201222
PRODUCTION: CAMDX-000003
Default:
CAMDX-20201222
Headers
X-Road-Client
string
required
X-Road-Client Request Header * Example: CAMBODIA/GOV/CAMDX-20201234/SUBSYTEM_CODE

Body

application/json

application/json
userInfo
User Info
User Information

Example:
{"idNumber":"011196245","firstNameKh":"ការឌុល","lastNameKh":"អេង","firstNameEn":"KADOL","lastNameEn":"ENG","gender":"M","dob":"2000-05-06","issuedDate":"2016-03-23","expiredDate":"2026-03-22"}
idNumber
string
ID Card Number

firstNameKh
string
First name in Khmer

lastNameKh
string
Last name in Khmer

firstNameEn
string
First name in English

lastNameEn
string
Last name in English

gender
string
Gener

Allowed values:
M
F
Example:
M
dob
string<date>
Date of birth

Example:
2000-01-31
issuedDate
string<date>
Issued Date

Example:
2000-01-31
expiredDate
string<date>
Expired Date

Example:
2000-01-31
faceImg
string
Example:
base_64_content
Responses
200
400
500
502
Successful Response

Body

application/json

application/json
responses
/
200
error
integer
required
message
string
required
data
object
userInfo
Response - Scoring Result
faceMoiScore
number
#Range [0,1]

curl --request POST \
  --url https://security-server.consumer1.com/r1/CAMBODIA/GOV/CAMDX-20201222/CAMDIGIKEY_KYC/info-face-v2.1 \
  --header 'Accept: application/json' \
  --header 'Content-Type: application/json' \
  --header 'X-Road-Client: ' \
  --data '{
  "userInfo": {
    "idNumber": "011196245",
    "firstNameKh": "ការឌុល",
    "lastNameKh": "អេង",
    "firstNameEn": "KADOL",
    "lastNameEn": "ENG",
    "gender": "M",
    "dob": "2000-05-06",
    "issuedDate": "2016-03-23",
    "expiredDate": "2026-03-22"
  },
  "faceImg": "base_64_content"
}'
{
  "error": 0,
  "message": "Successfully",
  "data": {
    "userInfo": {
      "idNumber": "012345678",
      "score": 1,
      "incorrectFields": [
        "incorrectFieldName"
      ]
    },
    "faceMoiScore": 0.5696822
  }
}

CamDigiKey KYC Verification API
Endpoints
powered by Stoplight
Verify User Info, ID Card and User Face
post
https://security-server.consumer1.com/r1/CAMBODIA/GOV/{member_code}/CAMDIGIKEY_KYC/info-face-idcard-v2.1
Verification with submitted document, face verification with retrieved image from MOI
Verification of submitted information with MOI information
API Code: KH.GOV.CAMDX-000003.CAMDIGIKEY_KYC.info-face-idcard

Version: 2.1.0

Request
Path Parameters
member_code
string
required
CamDigiKey's Member:

DEVELOPMENT: CAMDX-20201222
PRODUCTION: CAMDX-000003
Default:
CAMDX-20201222
Headers
X-Road-Client
string
required
X-Road-Client Request Header * Example: CAMBODIA/GOV/CAMDX-20201234/SUBSYTEM_CODE

Body

application/json

application/json
userInfo
User Info
User Information

Example:
{"idNumber":"011196245","firstNameKh":"ការឌុល","lastNameKh":"អេង","firstNameEn":"KADOL","lastNameEn":"ENG","gender":"M","dob":"2000-05-06","issuedDate":"2016-03-23","expiredDate":"2026-03-22"}
idNumber
string
ID Card Number

firstNameKh
string
First name in Khmer

lastNameKh
string
Last name in Khmer

firstNameEn
string
First name in English

lastNameEn
string
Last name in English

gender
string
Gener

Allowed values:
M
F
Example:
M
dob
string<date>
Date of birth

Example:
2000-01-31
issuedDate
string<date>
Issued Date

Example:
2000-01-31
expiredDate
string<date>
Expired Date

Example:
2000-01-31
faceImg
string
Example:
base_64_content
idImage
string
Example:
base_64_content
Responses
200
400
500
502
Successful Response

Body

application/json

application/json
responses
/
200
error
integer
required
message
string
required
data
object
userInfo
Response - Scoring Result
faceDocumentScore
number
#Range [0,1]

faceMoiScore
number
#Range [0,1]

curl --request POST \
  --url https://security-server.consumer1.com/r1/CAMBODIA/GOV/CAMDX-20201222/CAMDIGIKEY_KYC/info-face-idcard-v2.1 \
  --header 'Accept: application/json' \
  --header 'Content-Type: application/json' \
  --header 'X-Road-Client: ' \
  --data '{
  "userInfo": {
    "idNumber": "011196245",
    "firstNameKh": "ការឌុល",
    "lastNameKh": "អេង",
    "firstNameEn": "KADOL",
    "lastNameEn": "ENG",
    "gender": "M",
    "dob": "2000-05-06",
    "issuedDate": "2016-03-23",
    "expiredDate": "2026-03-22"
  },
  "faceImg": "base_64_content",
  "idImage": "base_64_content"
}'
{
  "error": 0,
  "message": "Successfully",
  "data": {
    "userInfo": {
      "idNumber": "012345678",
      "score": 1,
      "incorrectFields": [
        "incorrectFieldName"
      ]
    },
    "faceDocumentScore": 0.9981736,
    "faceMoiScore": 0.5696822
  }
}

CamDigiKey KYC Verification API
Endpoints
powered by Stoplight
Verify User Info, ID Card Image, and Liveness
post
https://security-server.consumer1.com/r1/CAMBODIA/GOV/{member_code}/CAMDIGIKEY_KYC/info-idcard-liveness-v2.1
Liveness verification check, face verification with submitted document, face verification with retrieved image from MOI
Verification of submitted information with MOI information
API Code: KH.GOV.CAMDX-000003.CAMDIGIKEY_KYC.info-idcard-liveness

Version: 2.1.0

Request
Path Parameters
member_code
string
required
CamDigiKey's Member:

DEVELOPMENT: CAMDX-20201222
PRODUCTION: CAMDX-000003
Default:
CAMDX-20201222
Headers
X-Road-Client
string
required
X-Road-Client Request Header * Example: CAMBODIA/GOV/CAMDX-20201234/SUBSYTEM_CODE

Body

application/json

application/json
actions
array[string]
#1: turn face to the left, 2: turn face to the right, 3: nod the head

userInfo
User Info
User Information

Example:
{"idNumber":"011196245","firstNameKh":"ការឌុល","lastNameKh":"អេង","firstNameEn":"KADOL","lastNameEn":"ENG","gender":"M","dob":"2000-05-06","issuedDate":"2016-03-23","expiredDate":"2026-03-22"}
idNumber
string
ID Card Number

firstNameKh
string
First name in Khmer

lastNameKh
string
Last name in Khmer

firstNameEn
string
First name in English

lastNameEn
string
Last name in English

gender
string
Gener

Allowed values:
M
F
Example:
M
dob
string<date>
Date of birth

Example:
2000-01-31
issuedDate
string<date>
Issued Date

Example:
2000-01-31
expiredDate
string<date>
Expired Date

Example:
2000-01-31
idImage
string
Example:
base_64_content
liveness
string
Example:
base_64_content
Responses
200
400
500
502
Successful Response

Body

application/json

application/json
responses
/
200
error
integer
required
message
string
required
data
object
userInfo
Response - Scoring Result
livenessScore
number
#Range [0,1]

faceDocumentScore
number
#Range [0,1]

faceMoiScore
number
#Range [0,1]

curl --request POST \
  --url https://security-server.consumer1.com/r1/CAMBODIA/GOV/CAMDX-20201222/CAMDIGIKEY_KYC/info-idcard-liveness-v2.1 \
  --header 'Accept: application/json' \
  --header 'Content-Type: application/json' \
  --header 'X-Road-Client: ' \
  --data '{
  "actions": [
    "2",
    "1",
    "3"
  ],
  "userInfo": {
    "idNumber": "011196245",
    "firstNameKh": "ការឌុល",
    "lastNameKh": "អេង",
    "firstNameEn": "KADOL",
    "lastNameEn": "ENG",
    "gender": "M",
    "dob": "2000-05-06",
    "issuedDate": "2016-03-23",
    "expiredDate": "2026-03-22"
  },
  "idImage": "base_64_content",
  "liveness": "base_64_content"
}'
{
  "error": 0,
  "message": "Successfully",
  "data": {
    "userInfo": {
      "idNumber": "012345678",
      "score": 1,
      "incorrectFields": [
        "incorrectFieldName"
      ]
    },
    "faceDocumentScore": 0.9981736,
    "faceMoiScore": 0.5696822
  }
}

CamDigiKey KYC Verification API
Endpoints
powered by Stoplight
Khmer ID Card OCR
post
https://security-server.consumer1.com/r1/CAMBODIA/GOV/{member_code}/TSC-AI-API/ocr-idcard-v2.1
OCR extracts user's information from submitted identification image

API Code: KH.GOV.CAMDX-000012.TSC-AI-API.ocr-idcard

Version: 2.1.0

Request
Path Parameters
member_code
string
required
CamDigiKey's Member:

DEVELOPMENT: CAMDX-20201222
PRODUCTION: CAMDX-000012
Default:
CAMDX-20201222
Headers
X-Road-Client
string
required
X-Road-Client Request Header * Example: CAMBODIA/GOV/CAMDX-20201234/SUBSYTEM_CODE

Body

application/json

application/json
idImage
string
base_64_content

Responses
200
400
500
502
Successful Response

Body

application/json

application/json
error
integer
required
message
string
required
data
Response - User Info
User Information

idNumber
string
ID Card Number

firstNameKh
string
First name in Khmer

lastNameKh
string
Last name in Khmer

firstNameEn
string
First name in English

lastNameEn
string
Last name in English

gender
string
Gener

Allowed values:
M
F
Example:
M
dob
string
Date of birth

Example:
12/09/1984
issuedDate
string
Issued Date

Example:
13/09/2015
expiredDate
string
Expired Date

Example:
12/09/2025
address
string
MRZ1
string
MRZ2
string
MRZ3
string
curl --request POST \
  --url https://security-server.consumer1.com/r1/CAMBODIA/GOV/CAMDX-20201222/TSC-AI-API/ocr-idcard-v2.1 \
  --header 'Accept: application/json' \
  --header 'Content-Type: application/json' \
  --header 'X-Road-Client: ' \
  --data '{
  "idImage": "string"
}'
{
  "error": 0,
  "message": "Successfully",
  "data": {
    "idNumber": "123456789",
    "lastNameKh": "ហេង",
    "firstNameKh": "សំអុល",
    "dob": "12/09/1980",
    "gender": "M",
    "lastNameEn": "HENG",
    "firstNameEn": "SAMOL",
    "expiredDate": "12/09/2030",
    "issuedDate": "13/09/2020",
    "address": "ភូមិព្រៃធំ ឃុំពេជសារ ស្រុកកោះអណ្តែត តាកែវ",
    "MRZ1": "IDKHM123456789<<<<<<<<<<<<<<< ",
    "MRZ2": "123456M2509127KHM<<<<<<<<<<<4 ",
    "MRZ3": "HENG<<SAMOL<<<<<<<<<<<<<<<<<<<< "
  }
}CamDigiKey KYC Verification API
Endpoints
powered by Stoplight
Passport OCR
post
https://security-server.consumer1.com/r1/CAMBODIA/GOV/{member_code}/TSC-AI-API/ocr-passport-v2.1
OCR extracts user's information from submitted passport image

API Code: KH.GOV.CAMDX-000012.TSC-AI-API.ocr-passport

Version: 2.1.0

Request
Path Parameters
member_code
string
required
CamDigiKey's Member:

DEVELOPMENT: CAMDX-20201222
PRODUCTION: CAMDX-000012
Default:
CAMDX-20201222
Headers
X-Road-Client
string
required
X-Road-Client Request Header * Example: CAMBODIA/GOV/CAMDX-20201234/SUBSYTEM_CODE

Body

application/json

application/json
passportImage
string
base_64_content

Responses
200
400
500
502
Successful Response

Body

application/json

application/json
responses
/
200
error
integer
required
message
string
required
data
object
User Information

expiredDate
string
Expired Date

dob
string
Date of Birth

document_number
string
Passport Number

nationality
string
Nationality

gender
string
Gender

firstNameEn
string
Firstname in English

lastNameEn
string
Lastname in English

curl --request POST \
  --url https://security-server.consumer1.com/r1/CAMBODIA/GOV/CAMDX-20201222/TSC-AI-API/ocr-passport-v2.1 \
  --header 'Accept: application/json' \
  --header 'Content-Type: application/json' \
  --header 'X-Road-Client: ' \
  --data '{
  "passportImage": "string"
}'
{
  "error": 0,
  "message": "Successfully",
  "data": {
    "expiredDate": "string",
    "dob": "string",
    "document_number": "string",
    "nationality": "string",
    "gender": "string",
    "firstNameEn": "string",
    "lastNameEn": "string"
  }
}