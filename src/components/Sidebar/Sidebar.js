import React, { Component } from "react";
import { useLocation, NavLink } from "react-router-dom";

import { Nav } from "react-bootstrap";

import logo from "assets/img/reactlogo.png";

function Sidebar({ color, image, routes }) {
  const location = useLocation();
  const activeRoute = (routeName) => {
    return location.pathname.indexOf(routeName) > -1 ? "active" : "";
  };
  return (
    <div className="sidebar" data-image={image} data-color={color}>
      <div
        className="sidebar-background"
        style={{
          backgroundImage: "assets/img/sidebar-4.jpg"
        }}
      />
      <div className="sidebar-wrapper">
        <div
          className="logo"
          style={{
            width: "100%",
            height: "100px", // Hauteur du container du haut (ajuste ici si besoin)
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0",
            margin: "0"
          }}
        >
          <img
            src={require("assets/img/CloudSecureEval.jpg")}
            alt="logo"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover" // ou "contain" si tu veux respecter les proportions
            }}
          />
      </div>

        <Nav>
          {routes.map((prop, key) => {
            if (!prop.redirect)
              return (
                <li
                  className={
                    prop.upgrade
                      ? "active active-pro"
                      : activeRoute(prop.layout + prop.path)
                  }
                  key={key}
                >
                  <NavLink
                    to={prop.layout + prop.path}
                    className="nav-link"
                    activeClassName="active"
                  >
                    <i className={prop.icon} />
                    <p>{prop.name}</p>
                  </NavLink>
                </li>
              );
            return null;
          })}
        </Nav>
      </div>
    </div>
  );
}

export default Sidebar;
