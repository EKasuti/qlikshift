<a id="readme-top"></a>

## QlikShift

<details>
    <summary>Table of Contents</summary>
    <ol>
        <li>
            <a href="#about-the-project"> About the Project</a>
            <ul>
                <li><a href="#built-with">Built with</a></li>
            </ul>
        </li>
        <li>
            <a href="#getting-started">Getting Started</a>
            <ul>
                <li><a href="#prerequisites">Prerequisites</a></li>
                <li><a href="#installation">Installation</a></li>
            </ul>
        </li>
    </ol>

</details>

<!-- ABOUT THE PROJECT -->
## About The Project
QlikShift is a web application that streamlines shift assignments by ensuring that each team member is placed where they're needed most, when they're needed mostdesigned to manage and process student data. This repository contains the frontend implementation built using Next.js.


### Built with
This project is built using the following tech stack
* [![Next.js][Next.js]][Next-url]
* [![React][React.js]][React-url]
* [![Shadcn][Shadcn]][Shadcn-url]


<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

* You should have node installed
  ```sh
  npm install 
  ```

### Installation

_Follow the instruction below to get started._

1. Clone the repo
   ```sh
   git clone https://github.com/EKasuti/qlikshift.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Create .env file (reference .env.example)
   ```sh
   touch .env
   ```
4. Run it locally
   ```sh
   npm run dev
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>


# API Endpoints

All API routes are located in `src/app/`

**Landing Page**
| Route                        | Description                        |
|------------------------------|------------------------------------|
| `/`                          | Qlikshift's Landing page           |

**Authentication Pages**
| Route                        | Description                        |
|------------------------------|------------------------------------|
| `/login`                     | Login page                         |
| `/signup`                    | Signup page                        |

**Dashboard Pages**
| Route                           | Description                          |
|---------------------------------|--------------------------------------|
| `/dashboard`                    | Dashboard Home Page                  |
|---------------------------------|--------------------------------------|
| `/dashboard/students`           | Dashboard Students Page              |
| `/dashboard/students/:id`       | Dashboard Single Student Page        |
| `/dashboard/students/settings`  | Dashboard Student's Setting Page     |
|---------------------------------|--------------------------------------|
| `/dashboard/desks`              | Dashboard Desks Page                 |
| `/dashboard/desks/settings`     | Dashboard Desk's Setting Page        |
|---------------------------------|--------------------------------------|
| `/dashboard/assign`             | Dashboard Assign Shifts Page         |
|---------------------------------|--------------------------------------|


<!-- CONTRIBUTING -->
## Contributing

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- LICENSE -->
## License

Distributed under the Unlicense License. See [LICENSE](LICENSE) for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

Emmanuel Kasuti Makau - [@linkedin](https://www.linkedin.com/in/emmanuel-kasuti/) - emmanuel.k.makau.jr.26@dartmouth.edu

Project Link: [github repo](https://github.com/EKasuti/qlikshift_backend.git)

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- MARKDOWN LINKS & IMAGES -->
[Next.js]: https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Shadcn]: https://img.shields.io/badge/Shadcn-000000?style=for-the-badge&logo=shadcn&logoColor=white
[Shadcn-url]: https://shadcn.dev/