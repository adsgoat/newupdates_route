export default function RouteDescription({Title, Description, theme, textAlignment}) {
    return (
        // <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{  display:"flex", flexDirection:"column", alignItems: textAlignment ==="right" ? "flex-end" : "flex-start", width:"100%", textAlign: textAlignment, }}>
                <h4 style={{
                    margin: 0,
                    // fontSize: '20px',
                    fontWeight: 700,
                    color: theme === 'dark' ? '#fff' : '#4b5563',  // gray-700
                    width:"100%"
                }}>
                    {Title}
                </h4>
                <p style={{
                    margin: 0,
                    fontSize: '11px',
                    fontWeight: 450,
                    color: theme === 'dark' ? '#cbd5e1' : '#6b7280'  // gray-500
                }}>
                    {Description}
                </p>
            </div>

        // </div>
    )
}