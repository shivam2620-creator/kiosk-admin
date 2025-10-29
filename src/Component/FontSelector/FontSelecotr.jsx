import { useState, useEffect, useRef } from "react";
import "./style.css";

const FontSelector = ({ onSelect }) => {
  const [fonts, setFonts] = useState([]);
  const [search, setSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null); // "primary" or "secondary"
  const dropdownRef = useRef(null);

  const [selectedFonts, setSelectedFonts] = useState({
    primary: "",
    secondary: "",
  });

  // ✅ Fetch fonts
  useEffect(() => {
    const fetchFonts = async () => {
      try {
        const res = await fetch(
          `https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyDITHlhP5ZK4XfW2z2Fhc5ATo7EfJR3cfw&sort=popularity`
        );
        const data = await res.json();
        setFonts(data.items.slice(0, 100));
      } catch (error) {
        console.error("Error fetching fonts:", error);
      }
    };
    fetchFonts();
  }, []);

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Filter fonts
  const filteredFonts = fonts.filter((font) =>
    font.family.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Select font handler
  const handleFontSelect = (type, fontName) => {
    setSelectedFonts((prev) => {
      const updated = { ...prev, [type]: fontName };
      onSelect([updated.primary, updated.secondary].filter(Boolean));
      return updated;
    });
    setOpenDropdown(null);
    setSearch("");
  };

  return (
    <div className="multi-font-selector" ref={dropdownRef}>
      <label className="select-font-heading">Font Family:</label>

      <div className="font-select-pair">
        {/* Primary Font */}
        <div className="font-select-box">
          <span className="font-label">Primary Font</span>
          <div
            className={`dropdown-input ${
              openDropdown === "primary" ? "active" : ""
            }`}
            onClick={() =>
              setOpenDropdown(openDropdown === "primary" ? null : "primary")
            }
          >
            {selectedFonts.primary || "Select Font"}
            <span className="arrow">
              {openDropdown === "primary" ? "▲" : "▼"}
            </span>
          </div>

          {openDropdown === "primary" && (
            <div className="dropdown-menu">
              <input
                type="text"
                placeholder="Search font..."
                className="dropdown-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="dropdown-list">
                {filteredFonts.length > 0 ? (
                  filteredFonts.map((font) => (
                    <div
                      key={font.family}
                      className={`dropdown-item ${
                        selectedFonts.primary === font.family ? "selected" : ""
                      }`}
                      onClick={() => handleFontSelect("primary", font.family)}
                      style={{ fontFamily: font.family }}
                    >
                      {font.family}
                    </div>
                  ))
                ) : (
                  <div className="no-results">No fonts found</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Secondary Font */}
        <div className="font-select-box">
          <span className="font-label">Secondary Font</span>
          <div
            className={`dropdown-input ${
              openDropdown === "secondary" ? "active" : ""
            }`}
            onClick={() =>
              setOpenDropdown(openDropdown === "secondary" ? null : "secondary")
            }
          >
            {selectedFonts.secondary || "Select Font"}
            <span className="arrow">
              {openDropdown === "secondary" ? "▲" : "▼"}
            </span>
          </div>

          {openDropdown === "secondary" && (
            <div className="dropdown-menu">
              <input
                type="text"
                placeholder="Search font..."
                className="dropdown-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="dropdown-list">
                {filteredFonts.length > 0 ? (
                  filteredFonts.map((font) => (
                    <div
                      key={font.family}
                      className={`dropdown-item ${
                        selectedFonts.secondary === font.family
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => handleFontSelect("secondary", font.family)}
                      style={{ fontFamily: font.family }}
                    >
                      {font.family}
                    </div>
                  ))
                ) : (
                  <div className="no-results">No fonts found</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FontSelector;
