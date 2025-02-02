import * as React from "react";

function SvgComponent() {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {/* SVG com as barras */}
      <svg
        width={324}
        height={52}
        viewBox="0 0 324 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_12_3010)">
          {/* Barra amarela */}
          <rect x="0" y="0" width="162" height="52" fill="yellow" />
          
          {/* Barra preta */}
          <rect x="162" y="0" width="162" height="52" fill="black" />
        </g>
      </svg>

      {/* Texto fora do SVG à direita */}
      <span style={{ fontSize: "25px", color: "black", marginLeft: "10px" }}>
        Escalonador de Processos
      </span>
    </div>
  );
}

export default SvgComponent;
