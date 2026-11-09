// let numbers = [10, 15, 20, 25, 30, 35, 40];

// function getEvenNumbers(numbers){
// let evenNumbers = numbers.filter(number => number % 2=== 0)
// let largeNumbers = numbers.filter(number => number > 20)

// console.log(evenNumbers)

// return evenNumbers, largeNumbers
// }
// getEvenNumbers(numbers)


// let numbers2 = [12,10, 15, 20, 25, 30, 35, 40];

// function getLargeEvenNumbers(numbers2){

// let largeNumbers = numbers2.filter(number => number < 20)


// console.log(largeNumbers)
// return largeNumbers
// }
// getLargeEvenNumbers(numbers2)

// let numbers = [10, 15, 20, 25, 30, 35, 40];

// function getSquaredEvenNumbers(numbers){
//     let evenNumbers = numbers.filter(number => number % 2 === 0 )
//     let square = evenNumbers.map(num => num ** 2)

//     // console.log(evenNumbers)
//     // console.log(square)
// return square
// }

// let result = getSquaredEvenNumbers(numbers)

// console.log(result)

// let numbers = [2, 3, 4, 5, 6, 7, 8, 9];

// function getSquareOddnumbers(numbers){
//     let oddNumbers = numbers.filter(number => number % 2 === 1)
//     let square = oddNumbers.map(num => num ** 2)
//     // console.log(oddNumbers)
// return square
// }

// let result = getSquareOddnumbers(numbers)

// console.log(result)

// let numbers = [10, 15, 20, 25, 30, 35, 40];

// function getSumOfEvenNumbers(numbers) {
//     let evenNumbers = numbers.filter(number => number % 2 === 0)
//     let total = evenNumbers.reduce((acc,current)=>{
//         return acc + current
//     },0)
//    return total

// }
// let result = getSumOfEvenNumbers(numbers) 
// console.log(result)

// let numbers = [2, 3, 4, 5, 6, 7, 8];

// function getSumOfSquaredEvenNumbers(numbers) {
//     let evenNumbers = numbers.filter(number => number % 2 === 0)
//     let squareNumbers = evenNumbers.map(num => num ** 2)
//     let sumNumbers = squareNumbers.reduce((acc,current)=>{
//         return acc + current
//     },0)

//     return sumNumbers


// }

// let result = getSumOfSquaredEvenNumbers(numbers)
// console.log(result)

// let students = [
//     { name: "Ali", marks: 85 },
//     { name: "Ahmed", marks: 35 },
//     { name: "Usman", marks: 70 },
//     { name: "Bilal", marks: 40 },
//     { name: "Hamza", marks: 90 }
// ];

// function studentResult(students) {
//     let passStudent = students.filter(student => student.marks >= 50)
//      let studentName = passStudent.map(student => student.name )

//      let totalMarks = passStudent.reduce((acc,current)=>{
//         return acc + current.marks
//      },0)
//     //  console.log(studentName)
//     //  console.log(totalMarks)
//     return {totalMarks,studentName}
// }

// let result = studentResult(students)
// console.log(result)

// let students = [
//     { name: "Ali", marks: 85 },
//     { name: "Ahmed", marks: 35 },
//     { name: "Usman", marks: 70 },
//     { name: "Bilal", marks: 40 },
//     { name: "Hamza", marks: 90 }
// ];

// function studentResult(students) {
// let detailResult = students.map(student =>{
//     if (student.marks  >= 50){
//        return { name:student.name,
//             marks:student.marks,
//             status:"pass"}

//     }else{
//         return  {name:student.name,
//             marks:student.marks,
//             status:"fail"
//         }
//     }

// })
// return detailResult


// let students = [
//     { name: "Ali", marks: 85 },
//     { name: "Ahmed", marks: 35 },
//     { name: "Usman", marks: 70 },
//     { name: "Bilal", marks: 40 },
//     { name: "Hamza", marks: 90 }
// ];

// function studentResult(students) {
//     let detailResult = students.map(student => ({
//         name: student.name,
//          marks: student.marks,
//           status: student.marks >= 50 ? "pass" : "fail"
//     }))
//     return detailResult




// }
// let result = studentResult(students)
// console.log(result)

// let students = [
//     { name: "Ali", marks: 85 },
//     { name: "Ahmed", marks: 35 },
//     { name: "Usman", marks: 70 },
//     { name: "Bilal", marks: 40 },
//     { name: "Hamza", marks: 90 }
// ];

// function  getPassStudent(students){
//     let passStudent = students.filter(student => student.marks >= 50)
//     let studentName = passStudent.map(student => student.name)
   
//     let total = passStudent.reduce((acc,current)=>{
//         return acc + current.marks 
//     },0)
//     let average = Number((total /passStudent.length).toFixed(2))
//     return {
//         names: studentName,
//         averageMarks:average
//     }
// }

// let result = getPassStudent(students)
// console.log(result)

// let student = {
//     name: "Ali",
//     age: 20,
//     marks: 85
// };

// let name = student.name;
// let marks = student.marks

// console.log(name, marks)

// let user = {
//     name: "Kaleem",
//     email: "kaleem@gmail.com",
//     age: 25,
//     role: "Developer"
// };

// let {name,email,role} = user
// console.log(name,email,role)

// let product = {
//     title: "Laptop",
//     price: 85000,
//     category: "Electronics",
//     stock: 12
// };

// let {title:productName, price:productPrice, category} = product
// console.log(productName, productPrice, category)

// let employee = {
//     name: "kaleem",
//     salary: 50000,

// }

// let {name,salary, role="employe"} = employee

// console.log(name,salary,role)

// let employee = {
//     name: "Kaleem",
//     job: "Developer",
//     location: {
//         city: "Karachi",
//         country: "Pakistan"
//     }
// };

// let {location:{city,country}} = employee

// console.log(city,country)

// let student = {
//     name: "Ahmed",
//     age: 22
// };

// let newStudent ={
//     ...student, city:"karachi"
// }
// console.log(newStudent)

// let product = {
//     name: "Laptop",
//     price: 85000,
//     stock: 10
// };

// let updatedProduct ={
//     ...product, 
//     price:80000,
//     stock:15
// }
// console.log(product)
// console.log(updatedProduct)

// let userInfo = {
//     name: "Kaleem",
//     age: 25
// };

// let userAddress = {
//     city: "Karachi",
//     country: "Pakistan"
// };

// let fullUser = {
//     ...userInfo,...userAddress
// }

// console.log(fullUser)

// const nums = [4, 9, 16, 25, 36];

// function getSquare(){
//     let square = nums.map(num => num ** 2)
//     let graterthanTen =  nums.filter(num => num > 10)
//     let total = graterthanTen.reduce((acc,current)=>{
//         return acc + current
//     })
//     // console.log(square, graterthanTen, total)
//     return{
//         square,graterthanTen,total
//     }

    
// }

// let result = getSquare(nums)
// console.log(result)


// const students = [
//   { name: "Ali", marks: 82, city: "Karachi" },
//   { name: "Sara", marks: 45, city: "Lahore" },
//   { name: "Bilal", marks: 91, city: "Karachi" },
//   { name: "Hina", marks: 67, city: "Multan" },
// ];

// function studentsDetaile(students){
//     let passStudents = students.filter(student => student.marks > 60 )
//     let studentName = passStudents.map(student => student.name)
//     let total = passStudents.reduce((acc , current)=>{
//         return acc + current.marks
//     },0)

//     let average = total / passStudents.length

//      let  {studentName:studentNamee, city} = studentNameAndCity
//     let studentNameAndCity = {...studentName, city, status:students.marks > 50 ? "pass" : "fail"}






// }

// studentsDetaile(students)


 const students = [
  { name: "Ali", marks: 82, city: "Karachi" },
  { name: "Sara", marks: 45, city: "Lahore" },
  { name: "Bilal", marks: 91, city: "Karachi" },
  { name: "Hina", marks: 67, city: "Multan" },
]

function studentGroup(students){
    let groupOfName = students.reduce((acc,current )=>{
return acc + current.name

    },0)

    let {karachi:city, lahore:students.city, multan:students.city } = students
}

studentGroup(students)