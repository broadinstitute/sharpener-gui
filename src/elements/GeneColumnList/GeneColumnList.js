import _ from "lodash"
const GeneColumnList = ({array, split}) => {
    const columnCount = _.ceil(array.length / split);
    const arrayPartitions = partition(array, split);

    return (
        <table>
            {arrayPartitions.map(partition => {
                <tr>
                    {
                        partition.map(elemenent => <td>

                        </td>)
                    }
                </tr>
                }
            )}
        </table>
    )
};

function partition(items, size) {
    var result = _.groupBy(items, function(item, i) {
        return Math.floor(i/size);
    });
    return _.values(result);
}