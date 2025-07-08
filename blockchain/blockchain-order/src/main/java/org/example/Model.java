package org.hyperledger.fabric.samples.assettransfer;

import com.owlike.genson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hyperledger.fabric.contract.annotation.DataType;
import org.hyperledger.fabric.contract.annotation.Property;

@DataType()
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Asset {

    // 资产标识
    @Property()
    @JsonProperty("assetId")
    private String assetId;

    // 资产所有者
    @Property()
    @JsonProperty("owner")
    private String owner;

    // 资产名称
    @Property()
    @JsonProperty("assetName")
    private String assetName;

    // 资产描述
    @Property()
    @JsonProperty("description")
    private String description;

    // 资产价值
    @Property()
    @JsonProperty("value")
    private String value;

    // 资产创建时间
    @Property()
    @JsonProperty("createTime")
    private String createTime;
}
