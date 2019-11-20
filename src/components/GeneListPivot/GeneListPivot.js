import React from "react"
import HeatMap from "react-heatmap-grid"
import {SizeMe, withSize} from "react-sizeme";

const GenePivotStandard = ({size, geneListNames, geneListIds, geneNames, membershipMatrixAsRows}) => {
    return (
        <>
            {console.log(size)}
            { membershipMatrixAsRows && membershipMatrixAsRows.length > 0 ?
                <div style={{
                    fontSize: `${size.height/geneNames.length}px`
                }}>
                    <HeatMap
                        xLabels={geneListIds}
                        yLabels={geneNames}
                        data={membershipMatrixAsRows}
                        xLabelWidth={0}
                        height={size.height/geneNames.length}

                        cellStyle={(background, value, min, max, data, x, y) => ({
                            background: `rgba(66, 86, 244, ${value})`,
                        })}
                    />
                </div>
            : <></> }
        </>
    )
}

export default (GenePivotStandard);
