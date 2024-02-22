import React from "react";
import "./Tree.css";
import image1 from "./images/1.jpg";
import image2 from "./images/2.jpg";
import image3 from "./images/3.jpg";
// Import other images similarly

const ComponentName = () => {
  return (
    <div>
      <div className="container">
        <div className="row">
          <div className="tree">
            <ul>
              <li>
                {" "}
                <a href="#">
                  <img src={image1} />
                  <span>Child</span>
                </a>
                <ul>
                  <li>
                    <a href="#">
                      <img src={image2} />
                      <span>Grand Child</span>
                    </a>
                    <ul>
                      <li>
                        {" "}
                        <a href="#">
                          <img src="images/3.jpg" />
                          <span>Great Grand Child</span>
                        </a>{" "}
                      </li>
                      <li>
                        {" "}
                        <a href="#">
                          <img src="images/4.jpg" />
                          <span>Great Grand Child</span>
                        </a>{" "}
                      </li>
                    </ul>
                  </li>
                  <li>
                    {" "}
                    <a href="#">
                      <img src="images/5.jpg" />
                      <span>Grand Child</span>
                    </a>
                    <ul>
                      <li>
                        {" "}
                        <a href="#">
                          <img src="images/6.jpg" />
                          <span>Great Grand Child</span>
                        </a>{" "}
                      </li>
                      <li>
                        {" "}
                        <a href="#">
                          <img src="images/7.jpg" />
                          <span>Great Grand Child</span>
                        </a>{" "}
                      </li>
                      <li>
                        {" "}
                        <a href="#">
                          <img src="images/8.jpg" />
                          <span>Great Grand Child</span>
                        </a>{" "}
                      </li>
                    </ul>
                  </li>
                  <li>
                    <a href="#">
                      <img src="images/9.jpg" />
                      <span>Grand Child</span>
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentName;
